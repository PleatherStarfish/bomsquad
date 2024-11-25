import { Controller, useForm } from "react-hook-form";
import React, { useState } from "react";
import { flatMap, groupBy, uniqBy } from "lodash-es";

import { BomItem } from "../../types/bomListItem";
import useGetComponentsByIds from "../../services/useGetComponentsByIds";

interface CheckboxGridModalProps {
  bomData: BomItem[];
}

const CheckboxGridModal: React.FC<CheckboxGridModalProps> = ({ bomData }) => {
  const { control, handleSubmit, getValues } = useForm<{
    [key: string]: boolean;
  }>();
  const [exportOutput, setExportOutput] = useState<Record<string, string>>({});
  console.log(exportOutput);

  // Fetch supplier items for all components
  const componentIds = flatMap(bomData, (item) => item.components_options);
  const { componentsData, componentsAreLoading } =
    useGetComponentsByIds(componentIds);

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
  const groupedComponents = bomData.map((item) => ({
    description: item.description,
    supplierItems: flatMap(
      componentsData?.filter((component) =>
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
    ),
  }));

  // Handle export and format output
  const exportSelectedItems = () => {
    const selectedItems = getValues();
    const selectedSupplierItems = flatMap(groupedComponents, (component) =>
      component.supplierItems.filter(
        (item) =>
          selectedItems[
            `${component.description}-${item?.supplier}-${item?.id}`
          ]
      )
    );

    const groupedBySupplier = groupBy(selectedSupplierItems, "supplier");

    const formattedOutput: Record<string, string> = {};
    Object.entries(groupedBySupplier).forEach(([supplier, items]) => {
      if (supplier === "Mouser") {
        formattedOutput[supplier] = items
          .map((item) => `${item?.itemNumber} | ${item?.quantity}`)
          .join("\n");
      } else if (["DigiKey", "TME"].includes(supplier)) {
        formattedOutput[supplier] = items
          .map((item) => `${item?.itemNumber},${item?.quantity}`)
          .join("\n");
      } else {
        // Format as CSV for other suppliers
        formattedOutput[supplier] = [
          "Item Number,Quantity,Link", // Add CSV headers
          ...items.map(
            (item) => `${item?.itemNumber},${item?.quantity},${item?.link}`
          ),
        ].join("\n");
      }
    });

    setExportOutput(formattedOutput);
  };

  return (
    <div className="p-4">
      {componentsAreLoading ? (
        <div className="text-center text-gray-500 animate-pulse">
          Loading...
        </div>
      ) : (
        <>
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
                                          checked={field.value}
                                          className="w-4 h-4"
                                          onChange={(e) =>
                                            field.onChange(e.target.checked)
                                          }
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
          <button
            className="mt-4 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            onClick={handleSubmit(exportSelectedItems)}
          >
            Export
          </button>
          {Object.entries(exportOutput).map(([supplier, output]) => (
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
                  To generate a DigiKey cart, copy the text below, and paste it
                  into the{" "}
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
                  To generate a TME cart, copy the text below, and paste it into the{" "}
                  <a
                    className="text-blue-500 hover:underline"
                    href="https://www.tme.com/us/en-us/Profile/QuickBuy/load.html"
                    rel="noreferrer"
                    target="_blank"
                  >
                    TME Quick Buy tool
                  </a>
                  . Ensure each line contains a product’s symbol followed by its quantity, separated by a comma, semicolon, tab, or space. Each product must be listed on a separate line.
                </p>
              )}
              <div className="hover:bg-stone-200 bg-stone-100 cursor-copy p-4 rounded w-full text-left">
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
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default CheckboxGridModal;
