import React from "react";
import {
  useFieldArray,
  Control,
  Controller,
  UseFormRegister,
  UseFormClearErrors,
} from "react-hook-form";
import Select, { GroupBase, OptionsOrGroups } from "react-select";
import { currencyLookup } from "../../types/currency";
import { TrashIcon } from "@heroicons/react/24/outline";
import Alert from "../../ui/Alert";
import { AddComponentFormInputs } from "../../types/createComponentForm";

interface SupplierItemsProps {
  clearErrors: UseFormClearErrors<AddComponentFormInputs>;
  control: Control<AddComponentFormInputs>;
  register: UseFormRegister<AddComponentFormInputs>;
  suppliers: { name: string; id: string }[];
  errors: any;
}

const SupplierItems: React.FC<SupplierItemsProps> = ({
  clearErrors,
  control,
  register,
  suppliers,
  errors,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "supplier_items",
  });

  const requiredMarker = <span className="text-red-500">*</span>;

  return (
    <div className="md:col-span-2">
      <h4 className="text-sm font-medium text-gray-700 mb-1.5">
        Supplier Items {requiredMarker}
      </h4>
      {errors.supplier_items?.message && (
        <p className="text-red-500 text-sm">{errors.supplier_items.message}</p>
      )}
      {(fields ?? []).map((item, index) => (
        <div className="border p-4 rounded-md mb-4" key={item.id}>
          {index === 0 && (
            <div className="mb-3">
              <Alert icon padding="compact" variant="info">
                <p className="text-xs text-blue-500">
                  Suppliers are vendors where you can purchase components, such as
                  Mouser or DigiKey, in contrast to manufacturers who produce the
                  components. Please add one or more suppliers.
                </p>
              </Alert>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Supplier */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor={`supplier_items.${index}.supplier`}
              >
                Supplier {requiredMarker}
              </label>
              <Controller
                control={control}
                name={`supplier_items.${index}.supplier`}
                render={({ field }) => (
                  <Select
                    {...field}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    options={suppliers.map((item) => ({
                      label: item.name,
                      value: item.id,
                    })) as unknown as OptionsOrGroups<string, GroupBase<string>>}
                    placeholder="Select Supplier"
                  />
                )}
                rules={{ required: "Supplier is required" }}
              />
              {errors?.supplier_items?.[index]?.supplier && (
                <p className="text-red-500 text-sm">
                  {" "}
                  {errors.supplier_items[index].supplier.message}{" "}
                </p>
              )}
            </div>

            {/* Supplier Item Number */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor={`supplier_items.${index}.supplier_item_no`}
              >
                Supplier Item No. {requiredMarker}
              </label>
              <input
                {...register(`supplier_items.${index}.supplier_item_no`, {
                  required: "Supplier Item No. is required",
                })}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
                id={`supplier_items.${index}.supplier_item_no`}
                type="text"
              />
              {errors?.supplier_items?.[index]?.supplier_item_no && (
                <p className="text-red-500 text-sm">
                  {errors.supplier_items[index].supplier_item_no.message}
                </p>
              )}
            </div>

            {/* Price */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor={`supplier_items.${index}.price`}
              >
                Price {requiredMarker}
              </label>
              <input
                {...register(`supplier_items.${index}.price`, {
                  min: { message: "Price must be greater than 0", value: 0.01 },
                  required: "Price is required",
                })}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
                id={`supplier_items.${index}.price`}
                step="0.01"
                type="number"
              />
              {errors.supplier_items?.[index]?.price && (
                <p className="text-red-500 text-sm">
                  {errors.supplier_items[index].price.message}
                </p>
              )}
            </div>

            {/* Currency Dropdown */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor={`supplier_items.${index}.currency`}
              >
                Currency {requiredMarker}
              </label>
              <select
                {...register(`supplier_items.${index}.currency`, {
                  required: "Currency is required",
                })}
                className="w-full p-2 border border-gray-300 rounded"
              >
                {Object.entries(currencyLookup).map(([code, { name }]) => (
                  <option key={code} value={code}>
                    {name} ({code})
                  </option>
                ))}
              </select>
              {errors.supplier_items?.[index]?.currency && (
                <p className="text-red-500 text-sm">
                  {errors.supplier_items[index].currency.message}
                </p>
              )}
            </div>

            {/* Link */}
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor={`supplier_items.${index}.link`}
              >
                Link {requiredMarker}
              </label>
              <input
                {...register(`supplier_items.${index}.link`, {
                  pattern: {
                    message: "Invalid URL",
                    value: /^(https?:\/\/)?([\w\d\-]+\.)+[\w\d]{2,}(\/.*)?\/?$/,
                  },
                  required: "Link is required",
                })}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
                id={`supplier_items.${index}.link`}
                type="url"
              />
              {errors.supplier_items?.[index]?.link && (
                <p className="text-red-500 text-sm">
                  {errors.supplier_items[index].link.message}
                </p>
              )}
            </div>

            {/* Delete Button */}
            <div className="md:col-span-3 flex justify-end">
              <button
                className="mt-2 text-sm text-red-500 hover:text-red-700"
                onClick={() => remove(index)}
                type="button"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
      <button
        className="mt-2 px-4 py-2 text-sm text-white bg-brandgreen-600 rounded-md hover:bg-brandgreen-500"
        onClick={() => {
          clearErrors("supplier_items");
          append({
            currency: "USD",
            link: "",
            pcs: 1,
            price: 0,
            supplier: "",
            supplier_item_no: "",
          });
        }}
        type="button"
      >
        {(fields ?? []).length >= 1 ? "Add another supplier" : "Add supplier"}
      </button>

      {errors.supplier_items?.root && (
        <p className="text-red-500 text-sm mt-2">
          {errors.supplier_items.root.message}
        </p>
      )}
    </div>
  );
};

export default SupplierItems;
