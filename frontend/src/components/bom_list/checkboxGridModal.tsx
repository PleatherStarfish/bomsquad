import {
  Controller,
  Control,
  UseFormGetValues,
  UseFormReset,
} from "react-hook-form";
import React, { useMemo, useEffect } from "react";
import flatMap from "lodash/flatMap";
import uniqBy from "lodash/uniqBy";
import isEqual from "lodash/isEqual";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { LinkIcon } from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

import { BomItem } from "../../types/bomListItem";
import useGetComponentsByIds from "../../services/useGetComponentsByIds";

interface FormState {
  [key: string]: ItemType | null;
}

interface CheckboxGridModalProps {
  bomData: BomItem[];
  control: Control<FormState, any>;
  formattedOutput: Record<string, string>;
  getValues: UseFormGetValues<FormState>;
  reset: UseFormReset<FormState>;
  selectedPCBVersion?: string;
  setHasSelection: (arg0: boolean) => void;
  setFormattedOutput: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  watch: (names?: string[] | string) => FormState;
}

interface ItemType {
  id: string;
  supplier: string;
  itemNumber: string;
  link: string;
  price: number;
  quantity: number;
  description: string;
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
  const normalizeKey = (description: string) =>
    description.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

  // Filter BOM data by selected PCB version
  const filteredBomData = !selectedPCBVersion
    ? []
    : bomData.filter((item) =>
        item.pcb_version.some(
          (version) => version.version === selectedPCBVersion
        )
      );

  // Fetch supplier items for all components in filtered BOM data
  const componentIds = flatMap(
    filteredBomData,
    (item) => item.components_options
  );

  const { componentsData, componentsAreLoading } =
    useGetComponentsByIds(componentIds);

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
          description: normalizeKey(item.description), // Normalize description
          supplierItems: uniqBy(
            supplierItems,
            (supplierItem) => supplierItem?.id
          ),
        };
      }),
      (component) => component.description
    );

    return { groupedComponents, suppliers };
  }, [componentsData, filteredBomData]);

  // Function to generate and set formatted output
  const generateFormattedOutput = () => {
    const formState = getValues() as unknown as Record<string, ItemType | null>;

    // Check if any item is selected
    const isSelected = Object.values(formState).some((value) => value !== null);
    setHasSelection(isSelected);

    // Extract selected items from formState
    const selectedSupplierItems: ItemType[] = Object.values(formState).filter(
      (item): item is ItemType => item !== null
    );

    const groupedBySupplier: Record<string, typeof selectedSupplierItems> = {};

    selectedSupplierItems.forEach((item) => {
      if (!item || typeof item !== "object") {
        console.error("Invalid item encountered:", item);
        return; // Skip invalid items
      }

      if (!item.supplier) {
        console.warn("Item is missing 'supplier' field:", item);
        return;
      }

      const supplier = item.supplier;
      if (!groupedBySupplier[supplier]) {
        groupedBySupplier[supplier] = []; // Initialize the group if it doesn't exist
      }

      groupedBySupplier[supplier].push(item); // Add the item to the appropriate group
    });

    // Construct output for each supplier
    const output: Record<string, string> = {};
    Object.entries(groupedBySupplier).forEach(([supplier, items]) => {
      if (supplier === "Mouser") {
        output[supplier] = items
          .map((item) => `${item?.itemNumber}|${item?.quantity}`)
          .join("\n");
      } else if (["DigiKey", "TME", "Tayda"].includes(supplier)) {
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

    // Update the formatted output if it has changed
    if (!isEqual(formattedOutput, output)) {
      setFormattedOutput(output);
    }
  };

  // Updated handler to toggle check all / uncheck all for a column
  const handleCheckAllColumn = (supplier: string, shouldCheck: boolean) => {
    const currentValues = getValues();
    const updatedValues: FormState = { ...currentValues };
  
    // Directly use shouldCheck: if true, check all; if false, uncheck all.
    groupedComponents.forEach((component) => {
      const matchingItems = component.supplierItems.filter(
        (item) => item?.supplier === supplier
      );
      matchingItems.forEach((item) => {
        const fieldName = `${normalizeKey(component.description)}-${supplier}-${item?.id}`;
        if (shouldCheck) {
          updatedValues[fieldName] = {
            ...item,
            description: component.description,
            id: item?.id ?? "",
            itemNumber: item?.itemNumber ?? "",
            link: item?.link ?? "",
            price: item?.price ?? 0,
            quantity: item?.quantity ?? 0,
            supplier: supplier ?? "",
          };
        } else {
          updatedValues[fieldName] = null;
        }
      });
    });
  
    reset(updatedValues);
    generateFormattedOutput();
  };
  

  // This component renders a checkbox in the supplier header that
  // automatically sets itself as checked if every checkbox in that column is selected,
  // unchecked if none are selected, and indeterminate if only some are.
  const SupplierHeaderCheckbox: React.FC<{ supplier: any }> = ({ supplier }) => {
    // Use getValues to retrieve the current form state.
    // Note: getValues() is not reactive, so ensure that a parent update or other mechanism triggers a re-render when form state changes.
    const formValues = getValues();
  
    let total = 0;
    let checkedCount = 0;
  
    // Loop through grouped components and filter out undefined items.
    groupedComponents.forEach((component) => {
      const validItems = component.supplierItems.filter(
        (item): item is ItemType => item !== undefined && item.supplier === supplier
      );
      validItems.forEach((item) => {
        total++;
        const fieldName = `${normalizeKey(component.description)}-${supplier}-${item.id}`;
        if (formValues[fieldName]) {
          checkedCount++;
        }
      });
    });
  
    const isChecked = total > 0 && checkedCount === total;
    const isIndeterminate = checkedCount > 0 && checkedCount < total;
    const checkboxRef = React.useRef<HTMLInputElement>(null);
  
    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = isIndeterminate;
      }
    }, [isIndeterminate]);
  
    return (
      <input
        checked={isChecked}
        className="w-4 h-4"
        onChange={(e) => handleCheckAllColumn(supplier, e.target.checked)}
        ref={checkboxRef}
        type="checkbox"
      />
    );
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
            <table className="min-w-full border border-collapse border-gray-200">
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
                      <div className="flex flex-col">
                        <span>{supplier}</span>
                        <SupplierHeaderCheckbox supplier={supplier} />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groupedComponents.map((component) => (
                  <tr key={component.description}>
                    <td className="px-4 py-2 border border-gray-200">
                      {component.description.replace(/_/g, " ")}
                    </td>
                    {suppliers.map((supplier) => {
                      const matchingSupplierItems =
                        component.supplierItems.filter(
                          (item) => item?.supplier === supplier
                        );
                      return (
                        <td
                          className="px-4 py-2 border border-gray-200"
                          key={`${normalizeKey(
                            component.description
                          )}-${supplier}`}
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
                                      defaultValue={null}
                                      name={`${normalizeKey(
                                        component.description
                                      )}-${supplier}-${item?.id}`}
                                      render={({ field }) => (
                                        // @ts-ignore
                                        <input
                                          {...field}
                                          checked={field.value !== null}
                                          className="w-4 h-4"
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              // Store the item data in the form state when checked
                                              field.onChange({
                                                ...item,
                                                description:
                                                  component.description,
                                              });
                                            } else {
                                              // Remove the item data from the form state when unchecked
                                              field.onChange(null);
                                            }
                                            generateFormattedOutput();
                                          }}
                                          type="checkbox"
                                        />
                                      )}
                                    />
                                    {item?.itemNumber ? (
                                      <a
                                        className="text-blue-500 hover:underline text-2xs"
                                        href={item?.link}
                                        rel="noreferrer"
                                        target="_blank"
                                      >
                                        {item?.itemNumber}
                                      </a>
                                    ) : (
                                      <a
                                        className="text-blue-500 hover:underline text-2xs"
                                        href={item?.link}
                                        rel="noreferrer"
                                        target="_blank"
                                      >
                                        <LinkIcon className="inline-block w-3 h-3" />
                                      </a>
                                    )}
                                    <span className="text-gray-600 text-2xs">
                                      {item?.price ? `($${item?.price})` : ""}
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
                <h3 className="mb-2 text-lg font-semibold text-left text-gray-800">
                  {supplier}
                </h3>
                {supplier === "Mouser" && (
                  <p className="mb-4 text-sm text-left text-gray-600">
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
                  <p className="mb-4 text-sm text-left text-gray-600">
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
                  <p className="mb-4 text-sm text-gray-600">
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
                {supplier === "Tayda" && (
                  <p className="mb-4 text-sm text-gray-600">
                    To generate a Tayda cart, copy the text below, and paste it
                    into the{" "}
                    <a
                      className="text-blue-500 hover:underline"
                      href="https://www.taydaelectronics.com/quick-order/"
                      rel="noreferrer"
                      target="_blank"
                    >
                      Tayda Quick Order tool
                    </a>
                    . Ensure each line contains a product’s symbol followed by
                    its quantity, separated by a comma. Each product must be
                    listed on a separate line.
                  </p>
                )}
                <div className="relative w-full p-4 text-left rounded hover:bg-stone-200 bg-stone-100 cursor-copy">
                  <pre
                    className="text-sm text-gray-800 whitespace-pre-wrap"
                    onClick={() => {
                      navigator.clipboard.writeText(output).then(() => {
                        alert("Copied to clipboard!");
                      });
                    }}
                  >
                    {output}
                  </pre>
                  <ClipboardDocumentListIcon
                    className="absolute w-6 h-6 text-gray-600 cursor-pointer top-2 right-2 hover:text-gray-800"
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
