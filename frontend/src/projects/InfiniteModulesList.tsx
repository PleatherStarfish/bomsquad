import { Module, ModuleFilterParams } from "../types/modules";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Button from "../ui/Button";
import Filters from "./Filters";
import InfiniteScroll from "react-infinite-scroll-component";
import ModulesList from "./ModulesList";
import { useModules } from "../services/useModules";

export type FormValues = {
  search: string;
  manufacturer: string;
  component_type: string;
  category: string;
  rack_unit: string;
  mounting_style: string;
  component_groups: {
    component: string;
    component_description: string;
    min: string | undefined;
    max: string | undefined;
  }[];
};

type FilterPill = {
  key: string;
  label: string;
  text: string;
};

export const MOUNTING_STYLES = [
  { label: "Surface Mount (SMT)", value: "smt" },
  { label: "Through Hole", value: "th" },
];

const getMountingStyleLabel = (value?: string) => {
  if (!value) {
    return ""; // or an empty string ""
  }
  const style = MOUNTING_STYLES.find((style) => style.value === value);
  return style ? style.label : value;
};

const truncate = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const InfiniteModulesList: React.FC = () => {
  const { control, register, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      category: "",
      component_groups: [
        { component: "", component_description: "", max: "", min: "" },
      ],
      component_type: "",
      manufacturer: "",
      mounting_style: "",
      rack_unit: "",
      search: "",
    },
  });

  const [filtersAnimationComplete, setFiltersAnimationComplete] =
    useState(false);
  const [filters, setFilters] = useState<ModuleFilterParams>({});
  const { data, fetchNextPage, hasNextPage, refetch, isLoading } =
    useModules(filters);
  const filtersApplied = Object.keys(filters).length > 0;

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const newFilters: ModuleFilterParams = {
      category: data.category,
      component_groups: data.component_groups.map((group) => ({
        component: group.component,
        component_description: group.component_description,
        max: group.max ? parseInt(group.max, 10) : undefined,
        min: group.min ? parseInt(group.min, 10) : undefined,
      })),
      component_type: data.component_type,
      manufacturer: data.manufacturer,
      mounting_style: data.mounting_style,
      rack_unit: data.rack_unit,
      search: data.search,
    };

    setFilters(newFilters);
    await refetch();
  };

  const modules =
    data?.pages?.flatMap((page) => (page as { modules: Module[] }).modules) ||
    [];

  const clearFilter = (key: string) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      // Check if key is a component group key with an index, like "component_groups-0"
      const match = key.match(/^component_groups-(\d+)$/);
      if (match) {
        const index = parseInt(match[1], 10);

        // Remove the specified component group by index
        const updatedGroups = [...(newFilters.component_groups || [])];
        updatedGroups.splice(index, 1);
        newFilters.component_groups = updatedGroups.length
          ? updatedGroups
          : undefined;

        // Clear the specific group fields in the form state
        setValue(`component_groups.${index}.component`, "");
        setValue(`component_groups.${index}.component_description`, "");
        setValue(`component_groups.${index}.min`, "");
        setValue(`component_groups.${index}.max`, "");
      } else {
        // Otherwise, clear as a regular filter field
        delete newFilters[key];
        setValue(key as keyof FormValues, "");
      }

      return newFilters;
    });
  };

  const clearAllFilters = () => {
    reset();
    setFilters({});
  };

  // Prepare pill strings outside JSX
  const filterPills: FilterPill[] = Object.entries(filters).flatMap(
    ([key, value]) => {
      if (key === "component_groups" && Array.isArray(value)) {
        return value
          .map((group, index) => {
            const groupText = [
              group.component_description &&
                `${truncate(group.component_description, 20)}`,
              group.min && `Min: ${group.min}`,
              group.max && `Max: ${group.max}`,
            ]
              .filter(Boolean)
              .join(", ");
            return groupText
              ? {
                  key: `${key}-${index}`,
                  label: `Component [${index + 1}]`,
                  text: groupText,
                }
              : null;
          })
          .filter((pill): pill is FilterPill => pill !== null); // Filter out nulls and assert type
      } else if (key === "mounting_style" && value) {
        return [
          {
            key,
            label: "Mounting Style",
            text: getMountingStyleLabel(value as string),
          },
        ];
      } else if (value) {
        return [
          {
            key,
            label: key.replace("_", " "),
            text: truncate(Array.isArray(value) ? value.join(", ") : value, 15),
          },
        ];
      }
      return [];
    }
  );

  return (
    <div className="py-12 mx-auto">
      <Filters
        control={control}
        onAnimationComplete={() => setFiltersAnimationComplete(true)}
        onSubmit={onSubmit}
        register={register}
        setValue={setValue}
        watch={watch}
      />

      <div className="flex justify-between mb-4">
        <div className="flex flex-wrap gap-2 text-xs grow">
          {filterPills.map(({ key, label, text }) => (
            <div className="flex items-center" key={key}>
              <span className="mr-2 font-semibold text-gray-700">{label}:</span>
              <button
                className="flex items-center bg-slate-500 text-white rounded-full px-3 py-0.5 font-sans font-semibold hover:bg-slate-600"
                onClick={() => clearFilter(key as keyof FormValues)}
              >
                <span>{text}</span>
                <span className="ml-1 text-white hover:text-red-200">×</span>
              </button>
            </div>
          ))}
        </div>

        {filterPills.length > 0 && (
          <Button
            classNames="bg-gray-300"
            onClick={clearAllFilters}
            size="sm"
            tooltipText="Clear all filters"
            variant="none"
          >
            Clear
          </Button>
        )}
      </div>

      <InfiniteScroll
        dataLength={modules.length}
        endMessage={
          !filtersApplied && !isLoading ? (
            <div className="flex justify-center w-full pt-24 pb-12">
              <div className="w-[500px]">
                <p className="text-center text-gray-300">
                  That&apos;s all the projects for now! Subscribe on{" "}
                  <a
                    className="text-blue-400 hover:text-blue-600"
                    href="https://ko-fi.com/bomsquad"
                  >
                    Ko-Fi
                  </a>{" "}
                  and help us pick the next BOM to add!
                </p>
              </div>
            </div>
          ) : undefined
        }
        hasMore={hasNextPage || false}
        loader={<p className="text-center animate-pulse">Loading...</p>}
        next={fetchNextPage}
      >
        {/* <h1 className="my-6 mb-16 text-4xl font-display">Projects</h1> */}

        {isLoading ? (
          <div className="text-center text-gray-500 animate-pulse">
            Loading...
          </div>
        ) : (
          <ModulesList
            filtersApplied={filtersApplied}
            isLoading={isLoading}
            modules={modules}
            shouldAnimate={filtersAnimationComplete}
          />
        )}
      </InfiniteScroll>
    </div>
  );
};

export default InfiniteModulesList;
