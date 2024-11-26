import { Controller, Control, UseFormGetValues, UseFormReset } from "react-hook-form";
import React, { useMemo, useEffect } from "react";
import { flatMap, groupBy, uniqBy, isEqual } from "lodash-es";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { BomItem } from "../../types/bomListItem";
import useGetComponentsByIds from "../../services/useGetComponentsByIds";

interface CheckboxGridModalProps {
  bomData: BomItem[];
  control: Control<{[key: string]: boolean}, any>;
  formattedOutput: Record<string, string>;
  getValues: UseFormGetValues<{[key: string]: boolean}>;
  reset: UseFormReset<{ [key: string]: boolean }>;
  selectedPCBVersion?: string;
  setHasSelection: (arg0: boolean) => void;
  setFormattedOutput: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

const CheckboxGridModal: React.FC<CheckboxGridModalProps> = ({
  bomData,
  control,
  formattedOutput,
  getValues,
  reset,
  selectedPCBVersion,
  setHasSelection,
  setFormattedOutput,
}) => {
  // Filter BOM data by selected PCB version
  const filteredBomData = !selectedPCBVersion
    ? []
    : bomData.filter((item) =>
        item.pcb_version.some(
          (version) => version.version === selectedPCBVersion
        )
      );

  // Fetch supplier items for all components in filtered BOM data
  const componentIds = flatMap(filteredBomData, (item) => item.components_options);

  const { componentsData, componentsAreLoading } = useGetComponentsByIds(componentIds);

  const { suppliers, groupedComponents } = useMemo(() => {
    if (!componentsData) {
      return { groupedComponents: [], suppliers: [] };
    }

    // Extract unique suppliers
    const suppliers = uniqBy(
      flatMap(componentsData, (component) =>
        component.supplier_items?.map(
          (item) => item.supplier?.short_name || "Unknown Supplier"
        )
      ),
      (supplier) => supplier
    );

    // Group components and their supplier items
    const groupedComponents = uniqBy(
      filteredBomData.map((item) => {
        const supplierItems = flatMap(
          componentsData.filter((component) =>
            item.components_options.includes(component.id)
          ),
          (component) =>
            component.supplier_items?.map((supplierItem) => ({
              id: supplierItem.id,
              itemNumber: supplierItem.supplier_item_no,
              link: supplierItem.link,
              price: supplierItem.unit_price,
              quantity: item.quantity,
              supplier: supplierItem.supplier?.short_name || "Unknown Supplier",
            }))
        );

        return {
          description: item.description,
          supplierItems: uniqBy(supplierItems, (supplierItem) => supplierItem?.id),
        };
      }),
      (component) => component.description
    );

    return { groupedComponents, suppliers };
  }, [componentsData, filteredBomData]);

  // Function to generate and set formatted output
  const generateFormattedOutput = () => {
    const formState = getValues();
    const isSelected = Object.values(formState).some((value) => value === true);
    setHasSelection(isSelected);

    const selectedSupplierItems = flatMap(groupedComponents, (component) =>
      component.supplierItems.filter(
        (item) =>
          formState[
            `${component.description}-${item?.supplier}-${item?.id}`
          ]
      )
    );

    const groupedBySupplier = groupBy(selectedSupplierItems, "supplier");

    const output: Record<string, string> = {};
    Object.entries(groupedBySupplier).forEach(([supplier, items]) => {
      if (supplier === "Mouser") {
        output[supplier] = items
          .map((item) => `${item?.itemNumber}|${item?.quantity}`)
          .join("\n");
      } else if (["DigiKey", "TME"].includes(supplier)) {
        output[supplier] = items
          .map((item) => `${item?.itemNumber},${item?.quantity}`)
          .join("\n");
      } else {
        output[supplier] = [
          "Item Number,Quantity,Link", // Add CSV headers
          ...items.map(
            (item) => `${item?.itemNumber},${item?.quantity},${item?.link}`
          ),
        ].join("\n");
      }
    });

    // Only update if output has changed
    if (!isEqual(formattedOutput, output)) {
      setFormattedOutput(output);
    }
  };

  // Reset logic
  useEffect(() => {
    reset();
    setFormattedOutput({});
  }, [reset, selectedPCBVersion]);

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
      exit={{ opacity: 0, y: 20 }}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      {componentsAreLoading ? (
        <div className="text-center text-gray-500 animate-pulse">
          Loading...
        </div>
      ) : (
        <>
          {/* Supplier and Components Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left border border-gray-200">
                    Component
                  </th>
                  {suppliers.map((supplier) => (
                    <th
                      className="px-4 py-2 text-left border border-gray-200"
                      key={supplier}
                    >
                      {supplier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedComponents.map((component) => (
                  <tr key={component.description}>
                    <td className="px-4 py-2 border border-gray-200">
                      {component.description}
                    </td>
                    {suppliers.map((supplier) => {
                      const matchingSupplierItems =
                        component.supplierItems.filter(
                          (item) => item?.supplier === supplier
                        );
                      return (
                        <td
                          className="px-4 py-2 border border-gray-200"
                          key={`${component.description}-${supplier}`}
                        >
                          <div className="flex flex-col gap-y-2">
                            {matchingSupplierItems.length > 0
                              ? matchingSupplierItems.map((item) => (
                                  <div
                                    className="flex items-center space-x-2"
                                    key={item?.id}
                                  >
                                    <Controller
                                      control={control}
                                      name={`${component.description}-${supplier}-${item?.id}`}
                                      render={({ field }) => (
                                        // @ts-ignore
                                        <input
                                          {...field}
                                          checked={field.value || false}
                                          className="w-4 h-4"
                                          onChange={(e) => {
                                            field.onChange(e.target.checked)
                                            generateFormattedOutput()
                                          }}
                                          type="checkbox"
                                        />
                                      )}
                                    />
                                    <a
                                      className="text-blue-500 hover:underline text-2xs"
                                      href={item?.link}
                                      rel="noreferrer"
                                      target="_blank"
                                    >
                                      {item?.itemNumber}
                                    </a>
                                    <span className="text-2xs text-gray-600">
                                      {item?.price
                                        ? `($${item?.price})`
                                        : "N/A"}
                                    </span>
                                  </div>
                                ))
                              : "-"}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Formatted Output */}
          <div id="supplier-import-tool">
            {Object.entries(formattedOutput).map(([supplier, output]) => (
              <div className="p-4" key={supplier}>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 text-left">
                  {supplier}
                </h3>
                {supplier === "Mouser" && (
                  <p className="text-sm text-gray-600 mb-4 text-left">
                    To generate a Mouser cart, copy the text below, and paste it
                    into the{" "}
                    <a
                      className="text-blue-500 hover:underline"
                      href="https://www.mouser.com/Bom/CopyPaste"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Mouser BOM tool
                    </a>
                    .
                  </p>
                )}
                {supplier === "DigiKey" && (
                  <p className="text-sm text-gray-600 mb-4 text-left">
                    To generate a DigiKey cart, copy the text below, and paste
                    it into the{" "}
                    <a
                      className="text-blue-500 hover:underline"
                      href="https://www.digikey.com/en/mylists/list/bulk-add"
                      rel="noreferrer"
                      target="_blank"
                    >
                      DigiKey BOM tool
                    </a>
                    .
                  </p>
                )}
                {supplier === "TME" && (
                  <p className="text-sm text-gray-600 mb-4">
                    To generate a TME cart, copy the text below, and paste it
                    into the{" "}
                    <a
                      className="text-blue-500 hover:underline"
                      href="https://www.tme.com/us/en-us/Profile/QuickBuy/load.html"
                      rel="noreferrer"
                      target="_blank"
                    >
                      TME Quick Buy tool
                    </a>
                    . Ensure each line contains a product’s symbol followed by
                    its quantity, separated by a comma, semicolon, tab, or
                    space. Each product must be listed on a separate line.
                  </p>
                )}
                <div className="relative hover:bg-stone-200 bg-stone-100 cursor-copy p-4 rounded w-full text-left">
                  <pre
                    className="whitespace-pre-wrap text-sm text-gray-800"
                    onClick={() => {
                      navigator.clipboard.writeText(output).then(() => {
                        alert("Copied to clipboard!");
                      });
                    }}
                  >
                    {output}
                  </pre>
                  <ClipboardDocumentListIcon
                    className="absolute top-2 right-2 w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
                    onClick={() => {
                      navigator.clipboard.writeText(output).then(() => {
                        alert("Copied to clipboard!");
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
};

export default CheckboxGridModal;
