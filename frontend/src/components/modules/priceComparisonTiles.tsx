import React from "react";
import classNames from "classnames";
import { motion } from "framer-motion";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import useModuleCostStats from "../../services/useModuleCostStats";
import useGetUserCurrency from "../../services/useGetUserCurrency";
import convertUnitPrice from "../../utils/convertUnitPrice";

interface CombinedCostComparisonProps {
  module: {
    id: string;
    name: string;
    cost_built?: string | null;
    cost_built_link?: string | null;
    cost_built_third_party: boolean | null;
    cost_pcb_only?: string | null;
    cost_pcb_only_link?: string | null;
    cost_pcb_only_third_party: boolean | null;
    cost_pcb_plus_front?: string | null;
    cost_pcb_plus_front_link?: string | null;
    cost_pcb_plus_front_third_party: boolean | null;
    cost_kit?: string | null;
    cost_kit_link?: string | null;
    cost_kit_third_party: boolean | null;
    cost_partial_kit?: string | null;
    cost_partial_kit_link?: string | null;
    cost_partial_kit_third_party: boolean | null;
  };
}

interface OptionData {
  optionKey: string;
  rawLabel: string;
  storedCost: number;
  effectiveCost: number;
  isThirdParty: boolean;
  link: string | null;
}

const getGridClass = (count: number) => {
  return classNames("grid gap-4 p-6", {
    "grid-cols-1 md:grid-cols-1": count === 1,
    "grid-cols-1 md:grid-cols-2": count === 2 || count === 4,
    "grid-cols-1 md:grid-cols-3": count === 3 || count >= 5,
  });
};

const calculateEffectiveCost = (
  optionKey: string,
  storedCost: number,
  computedPartsCost: number
): number => {
  if (["pcbOnly", "pcbPlus"].includes(optionKey)) {
    return storedCost + (isNaN(computedPartsCost) ? 0 : computedPartsCost);
  }
  return storedCost;
};

const CombinedCostComparison: React.FC<CombinedCostComparisonProps> = ({
  module,
}) => {
  const { data: costStats, error } = useModuleCostStats(module.id);
  const { data: currencyData } = useGetUserCurrency(); // Fetch user's currency settings

  if (error)
    return (
      <div className="text-center text-red-500">Error loading cost stats.</div>
    );
  if (!costStats || !currencyData) return <></>;

  // Extract all the cost values
  const costValues = [
    costStats.cost_built,
    costStats.cost_pcb_only,
    costStats.cost_pcb_plus_front,
    costStats.cost_kit,
    costStats.cost_partial_kit
  ];

  // Filter out null or undefined values
  const validCosts = costValues.filter(cost => cost !== null && cost !== undefined);

  // Ensure there is more than one valid price before rendering
  if (validCosts.length < 2) return <></>;

  const computedPartsCost = parseFloat(costStats.overall.median);
  const parseCost = (value: number | string | null): number | null =>
    value ? parseFloat(value.toString()) : null;

  const rawOptions = [
    {
      field: module.cost_built,
      label: "Fully Built",
      link: module.cost_built_link,
      optionKey: "built",
      thirdParty: module.cost_built_third_party,
    },
    {
      field: module.cost_pcb_only,
      label: "PCB Only",
      link: module.cost_pcb_only_link,
      optionKey: "pcbOnly",
      thirdParty: module.cost_pcb_only_third_party,
    },
    {
      field: module.cost_pcb_plus_front,
      label: "PCB + Front",
      link: module.cost_pcb_plus_front_link,
      optionKey: "pcbPlus",
      thirdParty: module.cost_pcb_plus_front_third_party,
    },
    {
      field: module.cost_kit,
      label: "Complete Kit",
      link: module.cost_kit_link,
      optionKey: "kitComplete",
      thirdParty: module.cost_kit_third_party,
    },
    {
      field: module.cost_partial_kit,
      label: "Partial Kit",
      link: module.cost_partial_kit_link,
      optionKey: "kitPartial",
      thirdParty: module.cost_partial_kit_third_party,
    },
  ];

  const allOptions: OptionData[] = rawOptions
    .map(({ field, optionKey, label, thirdParty, link }) => {
      const storedCost = parseCost(field ?? null);
      if (!storedCost) return null;

      return {
        effectiveCost: calculateEffectiveCost(
          optionKey,
          storedCost,
          computedPartsCost
        ),
        isThirdParty: thirdParty ?? false,
        link,
        optionKey,
        rawLabel: label,
        storedCost,
      };
    })
    .filter((option): option is OptionData => option !== null);

  const optionDisplayLabels = {
    built: "Assembled Project",
    kitComplete: "DIY Kit",
    kitPartial: "DIY Partial Kit",
    pcbOnly: "PCB Only + self-sourced components",
    pcbPlus: "PCB + Front Panel + self-sourced components",
  };

  const builtOption =
    allOptions.find((opt) => opt.optionKey === "built") || null;
  const kitOptions = allOptions.filter(
    (opt) => opt.optionKey === "kitComplete" || opt.optionKey === "kitPartial"
  );
  const kitOption = kitOptions.length
    ? kitOptions.reduce((prev, curr) =>
        curr.effectiveCost < prev.effectiveCost ? curr : prev
      )
    : null;
  const otherOptions = allOptions.filter(
    (opt) => !["built", "kitComplete", "kitPartial"].includes(opt.optionKey)
  );

  let displayOptions = [builtOption, kitOption, ...otherOptions].filter(
    Boolean
  );

  return (
    <div className="my-8">
      <h2 className="mb-6 text-3xl text-center font-display">
        How Much Cheaper Is {module.name} When You Build It Yourself?
      </h2>
      <div className={getGridClass(displayOptions.length)}>
        {displayOptions.map((option, idx) => {
          if (!option) return null;
          const displayTitle =
            optionDisplayLabels[option.optionKey] || option.rawLabel;

          let savingsBuilt: number | null = null;
          let savingsKit: number | null = null;

          if (
            builtOption &&
            builtOption.effectiveCost > 0 &&
            option.effectiveCost > 0
          ) {
            const diff = builtOption.effectiveCost - option.effectiveCost;
            savingsBuilt =
              diff > 0
                ? Math.round((diff / builtOption.effectiveCost) * 100)
                : 0;
          }

          if (
            kitOption &&
            kitOption.effectiveCost > 0 &&
            option.effectiveCost > 0
          ) {
            const diff = kitOption.effectiveCost - option.effectiveCost;
            savingsKit =
              diff > 0 ? Math.round((diff / kitOption.effectiveCost) * 100) : 0;
          }

          return (
            <motion.a
              animate={{ opacity: 1, scale: 1 }}
              className={classNames(
                "relative flex flex-col justify-between p-6 bg-gray-100 rounded-lg min-h-52 transform transition-transform duration-500",
                {
                  "hover:scale-105 cursor-pointer": option.link,
                  "opacity-50 cursor-default": !option.link,
                }
              )}
              href={option.link ?? "#"}
              initial={{ opacity: 0, scale: 0.9 }}
              key={idx}
              rel={option.link ? "noopener noreferrer" : undefined}
              target={option.link ? "_blank" : undefined}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              {option.link && (
                <div className="absolute p-1 top-2 right-2">
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-600 transition-transform transform hover:text-gray-900 hover:scale-110" />
                </div>
              )}
              
              <h3 className="text-xl font-semibold text-gray-800">
                {displayTitle}
              </h3>

              <p className="text-3xl font-bold text-blue-600">
                {convertUnitPrice(option.effectiveCost, currencyData)}
              </p>

              <div className="mt-2">
                {savingsBuilt !== null && savingsBuilt > 0 && (
                  <p className="text-lg text-gray-500">
                    {savingsBuilt}% cheaper than assembled
                  </p>
                )}
                {savingsKit !== null && savingsKit > 0 && (
                  <p className="text-lg text-gray-500">
                    {savingsKit}% cheaper than kit
                  </p>
                )}
              </div>

              {option.isThirdParty && (
                <p className="mt-2 text-sm italic text-gray-600">
                  Available from a third party.
                </p>
              )}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

export default CombinedCostComparison;
