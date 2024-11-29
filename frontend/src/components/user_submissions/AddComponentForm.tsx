import React, { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import Select, { GroupBase, OptionsOrGroups } from "react-select";
import makeAnimated from "react-select/animated";

import { AddComponentFormInputs } from "../../types/createComponentForm";
import {
  useGetComponentDropdownOptions,
  useCreateComponent,
} from "../../services/useCreateComponent";
import Alert from "../../ui/Alert";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import SupplierItems from "./SupplierItems";
import VirtualizedMenuList from "./VirtualizedMenuList";

const animatedComponents = makeAnimated();

const mountingStyleOptions = [
  { label: "Surface Mount (SMT)", value: "smt" },
  { label: "Through Hole", value: "th" },
];

const unitOptions: Record<string, OptionType[]> = {
  farads: [
    { label: "pF", value: "pF" },
    { label: "nF", value: "nF" },
    { label: "μF", value: "μF" },
    { label: "mF", value: "mF" },
  ],
  ohms: [
    { label: "Ω", value: "Ω" },
    { label: "kΩ", value: "kΩ" },
    { label: "MΩ", value: "MΩ" },
  ],
};

type OptionType = {
  label: string;
  value: string;
};

const validationRules = {
  farads: {
    relevantTypes: ["Capacitor"],
    rules: {
      required: "Farads is required",
      validate: (value: number | undefined) =>
        (value !== undefined && value > 0) ||
        "Farads must be a positive number",
    },
  },
  ohms: {
    relevantTypes: [
      "Resistor",
      "Photoresistor (LDR)",
      "Potentiometer",
      "Trimpot",
    ],
    rules: {
      required: "Ohms is required",
      validate: (value: number | undefined) =>
        (value !== undefined && value > 0) || "Ohms must be a positive number",
    },
  },
  tolerance: {
    relevantTypes: ["Capacitor", "Resistor", "Potentiometer", "Trimpot"],
    rules: {
      rules: {
        validate: (value: string | undefined) =>
          !value ||
          /^(\+\/-|\+|-|\+-|-+)?\d+(\.\d+)?%$/.test(value) ||
          "Invalid tolerance format (e.g., '+5%', '+/-10%', '-+3%')",
      },
    },
  },
  voltage_rating: {
    relevantTypes: [
      "Resistor",
      "Capacitor",
      "Jack",
      "Potentiometer",
      "Trimpot",
    ],
    rules: {
      validate: (value: string | undefined) => {
        if (!value) return true; // Allow empty values if not required
        const match = value.match(/^(\d+(\.\d+)?)(V|kV|mV)$/);
        if (!match) return "Invalid voltage rating format (e.g., '5V', '0.3kV', '120mV')";
        const numericValue = parseFloat(match[1]);
        if (numericValue <= 0) return "Voltage must be greater than 0";
        return true;
      },
    },
  },
  wattage: {
    relevantTypes: ["Resistor", "Potentiometer", "Trimpot"],
    rules: {
      validate: (value: string | undefined) => {
        if (!value) return true; // Allow empty values if not required
        const match = value.match(/^(\d+(\.\d+)?)W$/);
        if (!match) return "Invalid wattage format (e.g., '5W', '0.3W')";
        const numericValue = parseFloat(match[1]);
        if (numericValue <= 0) return "Wattage must be greater than 0";
        return true;
      },
    },
  },
};

const transformSubmissionData = (data: any) => {
  const extractValue = (field: any) => (field && field.value ? field.value : field);

  return {
    component: {
      farads: data.farads || null,
      farads_unit: extractValue(data.farads_unit),
      manufacturer: extractValue(data.manufacturer),
      manufacturer_part_no: data.manufacturer_part_no,
      mounting_style: extractValue(data.mounting_style),
      ohms: extractValue(data.ohms),
      ohms_unit: extractValue(data.ohms_unit),
      tolerance: data.tolerance || null,
      type: extractValue(data.type),
      voltage_rating: data.voltage_rating || null,
      wattage: data.wattage || null,
    },
    quantity: data.quantity,
    supplier_items: data.supplier_items.map((item) => ({
      currency: item.currency,
      link: item.link || "",
      pcs: item.pcs ? parseInt(item.pcs, 1) : null,
      price: parseFloat(item.price || 0),
      supplier: extractValue(item.supplier),
      supplier_item_no: item.supplier_item_no || "",
    })),
  };
};

const typesRelevantTo: Record<string, string[]> = {
  farads: ["Capacitor"],
  ohms: ["Resistor", "Photoresistor (LDR)", "Potentiometer", "Trimpot"],
  tolerance: ["Capacitor", "Resistor", "Potentiometer", "Trimpot"],
  voltage_rating: ["Resistor", "Capacitor", "Jack", "Potentiometer", "Trimpot"],
  wattage: ["Resistor", "Potentiometer", "Trimpot"],
};

const AddComponentForm: React.FC<{
  formRef?: React.RefObject<HTMLFormElement>;
  handleSuccess: () => void;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  allowInventoryOption?: boolean;
}> = ({ formRef, isSubmitting, setIsSubmitting, handleSuccess, allowInventoryOption = false }) => {
  const [alert, setAlert] = useState<{
    type: "error" | "info" | "success";
    message: string;
    detailedMessage?: string;
  } | null>(null);

  const [addToInventory, setAddToInventory] = useState(false);
  const {
    clearErrors,
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AddComponentFormInputs>({
    defaultValues: {
      supplier_items: [],
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });
  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  const {
    data: dropdownOptions,
    isLoading,
    isError,
  } = useGetComponentDropdownOptions();
  const createComponentMutation = useCreateComponent();

  const onSubmit = async (data: AddComponentFormInputs) => {
    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);
  
    // Validate supplier items
    if (!data.supplier_items || data.supplier_items.length === 0) {
      setError("supplier_items", {
        message: "At least one supplier item is required.",
        type: "manual",
      });
      setIsSubmitting(false);
      return;
    }
  
    const transformedData = transformSubmissionData(data);
  
    try {
      // Submit the data via the mutation
      await createComponentMutation.mutateAsync(transformedData);
      handleSuccess();
    } catch (error: any) {
      if (error.fieldErrors) {
        const backendErrors = error.fieldErrors;
  
        // Handle field-specific errors for `component_errors`
        if (backendErrors.component_errors) {
          Object.entries(backendErrors.component_errors).forEach(
            ([field, messages]) => {
              if (Array.isArray(messages) && messages.length > 0) {
                setError(field as keyof AddComponentFormInputs, {
                  message: messages.join(" "),
                  type: "server",
                });
              }
            }
          );
        }
  
        // Handle supplier-specific errors for `supplier_item_no`
        if (backendErrors.supplier_item_no) {
          backendErrors.supplier_item_no.forEach((message: string, index: number) => {
            setError(
              `supplier_items.${index}.supplier_item_no` as keyof AddComponentFormInputs,
              {
                message,
                type: "server",
              }
            );
          });
        }
  
        // Generate a detailed message for the Alert
        const detailedMessage = Object.entries(backendErrors).flatMap(([field, messages]) => {
          if (field === "fieldErrors" && typeof messages === "object") {
            // @ts-ignore
            return Object.entries(messages).flatMap(([nestedField, nestedMessages]) => {
              if (typeof nestedMessages === "object") {
                 // @ts-ignore
                return Object.entries(nestedMessages).map(
                  ([subField, subMessages]) =>
                    `${nestedField}.${subField}: ${Array.isArray(subMessages) ? subMessages.join(", ") : subMessages}`
                );
              }
              return `${nestedField}: ${nestedMessages}`;
            });
          } else if (typeof messages === "object") {
             // @ts-ignore
            return Object.entries(messages).map(
              ([subField, subMessages]) =>
                `${field}.${subField}: ${Array.isArray(subMessages) ? subMessages.join(", ") : subMessages}`
            );
          }
          return `${field}: ${messages}`;
        }).join("\n");
  
        // Display the Alert
        setAlert({
          detailedMessage,
          message: error.message || "An error occurred while submitting the component.",
          type: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const typeOptions: OptionsOrGroups<string, GroupBase<string>> | undefined =
    dropdownOptions?.types?.map((type: any) => ({
      label: type.name,
      value: type.id,
    })) || [];

  const selectedType =
    (
      useWatch({
        control,
        name: "type",
      }) as unknown as OptionType | undefined
    )?.label || "";

  const isRelevant = (field: string) =>
    typesRelevantTo[field]?.includes(selectedType) || false;

  const requiredMarker = <span className="text-red-500">*</span>;

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading dropdown options.</div>;

  if (userIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  if (userIsError || !user) {
    return (
      <Alert icon variant="warning">
        <p>
          Please{" "}
          <a
            className="text-blue-500 hover:text-blue-700"
            href="https://bom-squad.com/accounts/login/"
          >
            <b>login</b>
          </a>{" "}
          or{" "}
          <a
            className="text-blue-500 hover:text-blue-700"
            href="https://bom-squad.com/accounts/signup/"
          >
            <b>create an account</b>
          </a>{" "}
          to add components.
        </p>
      </Alert>
    );
  }

  return (
    <>
      <div className="mb-6">
        {alert && (
          <Alert variant="warning">
            <p>{alert.message}</p>
            {alert.detailedMessage && (
              <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                {alert.detailedMessage}
              </pre>
            )}
          </Alert>
        )}
      </div>
      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={handleSubmit(onSubmit)}
        ref={formRef}
      >

        {/* Manufacturer */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="manufacturer"
          >
            Manufacturer {requiredMarker}
          </label>
          <Controller
            control={control}
            name="manufacturer"
            render={({ field }) => (
              <Select
                {...field}
                className="react-select-container"
                classNamePrefix="react-select"
                components={{
                  MenuList: VirtualizedMenuList,
                  ...animatedComponents,
                }}
                options={
                  dropdownOptions?.manufacturers?.map((manufacturer: any) => ({
                    label: manufacturer.name,
                    value: manufacturer.id,
                  })) || []
                }
                placeholder="Select Manufacturer"
              />
            )}
            rules={{
              required:
                'Manufacturer is required. If no specific manufacturer, select "Various."',
            }}
          />
          {errors.manufacturer && (
            <p className="text-red-500 text-sm">{errors.manufacturer.message}</p>
          )}
        </div>

        {/* Manufacturer Part Number */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="manufacturer_part_no"
          >
            Manufacturer Part No. {requiredMarker}
          </label>
          <input
            {...register("manufacturer_part_no", {
              required: "Manufacturer Part Number is required",
            })}
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
            id="manufacturer_part_no"
            type="text"
          />
          {errors.manufacturer_part_no && (
            <p className="text-red-500 text-sm">
              {errors.manufacturer_part_no.message}
            </p>
          )}
        </div>

        {/* Mounting Style */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="mounting_style"
          >
            Mounting Style {requiredMarker}
          </label>
          <Controller
            control={control}
            name="mounting_style"
            render={({ field }) => (
              <Select
                {...field}
                className="react-select-container"
                classNamePrefix="react-select"
                options={mountingStyleOptions}
              />
            )}
            rules={{ required: "Mounting Style is required." }}
          />
          {errors.mounting_style && (
            <p className="text-red-500 text-sm">
              {errors.mounting_style.message}
            </p>
          )}
        </div>

        {/* Type */}
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="type"
          >
            Type {requiredMarker}
          </label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                {...field}
                className="react-select-container"
                classNamePrefix="react-select"
                options={typeOptions}
              />
            )}
            rules={{ required: "Type is required." }}
          />
          {errors.type && (
            <p className="text-red-500 text-sm">{errors.type.message}</p>
          )}
        </div>

        {/* Conditional Fields */}
        {isRelevant("ohms") && (
          <>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="ohms"
              >
                Ohms {requiredMarker}
              </label>
              <input
                {...register("ohms")}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
                id="ohms"
                min={0}
                type="number"
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="ohms_unit"
              >
                Ohms Unit {requiredMarker}
              </label>
              <Controller
                control={control}
                name="ohms_unit"
                render={({ field }) => (
                  <Select
                    {...field}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    // @ts-ignore
                    options={unitOptions.ohms}
                  />
                )}
              />
              {errors.ohms && (
                <p className="text-red-500 text-sm">{errors.ohms.message}</p>
              )}
            </div>
          </>
        )}

        {isRelevant("farads") && (
          <>
            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="farads"
              >
                Farads {requiredMarker}
              </label>
              <input
                {...register(
                  "farads",
                  isRelevant("farads") ? validationRules.farads.rules : {}
                )}
                className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
                id="farads"
                min={0}
                type="number"
              />
              {errors.farads && (
                <p className="text-red-500 text-sm">{errors.farads.message}</p>
              )}
            </div>

            <div>
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="farads_unit"
              >
                Farads Unit {requiredMarker}
              </label>
              <Controller
                control={control}
                name="farads_unit"
                render={({ field }) => (
                  <Select
                    {...field}
                    className="react-select-container"
                    classNamePrefix="react-select"
                    // @ts-ignore
                    options={unitOptions.farads}
                  />
                )}
              />
              {errors.farads_unit && (
                <p className="text-red-500 text-sm">
                  {errors.farads_unit.message}
                </p>
              )}
            </div>
          </>
        )}

        {isRelevant("tolerance") && (
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="tolerance"
            >
              Tolerance
            </label>
            <input
              {...register("tolerance")}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
              id="tolerance"
              type="text"
            />
            {errors.tolerance && (
              <p className="text-red-500 text-sm">{errors.tolerance.message}</p>
            )}
          </div>
        )}

        {isRelevant("voltage_rating") && (
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="voltage_rating"
            >
              Voltage Rating
            </label>
            <input
              {...register("voltage_rating")}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
              id="voltage_rating"
              type="text"
            />
            {errors.voltage_rating && (
              <p className="text-red-500 text-sm">
                {errors.voltage_rating.message}
              </p>
            )}
          </div>
        )}

        {isRelevant("wattage") && (
          <div>
            <label
              className="block text-sm font-medium text-gray-700"
              htmlFor="wattage"
            >
              Wattage
            </label>
            <input
              {...register(
                "wattage",
                isRelevant("wattage") ? validationRules.wattage.rules : {}
              )}
              className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
              id="wattage"
              type="text"
            />
            {errors.wattage && (
              <p className="text-red-500 text-sm">{errors.wattage.message}</p>
            )}
          </div>
        )}

        <SupplierItems
          clearErrors={clearErrors}
          control={control}
          errors={errors}
          register={register}
          suppliers={dropdownOptions?.suppliers ?? []}
        />

        {/* Conditional Inventory Section */}
        {allowInventoryOption && (
          <div className="col-span-full">
            <div className="flex items-center">
              <input
                checked={addToInventory}
                className="mr-2"
                id="add_to_inventory"
                onChange={(e) => setAddToInventory(e.target.checked)}
                type="checkbox"
              />
              <label className="text-sm font-medium text-gray-700" htmlFor="add_to_inventory">
                Add this component to your inventory
              </label>
            </div>
            {addToInventory && (
              <div className="mt-4">
                <label
                  className="block text-sm font-medium text-gray-700"
                  htmlFor="quantity"
                >
                  Quantity
                </label>
                <input
                  {...register("quantity", {
                    validate: (value) => (value ?? 1) > 0 || "Quantity must be a positive number",
                    valueAsNumber: true,
                  })}
                  className="block w-full md:w-24 mt-1 border-gray-300 rounded-md shadow-sm focus:ring-brandgreen-500 focus:border-brandgreen-500 sm:text-sm"
                  id="quantity"
                  min={1}
                  type="number"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-sm">{errors.quantity.message}</p>
                )}
              </div>
            )}
          </div>
        )}
      </form>
    </>
  );
};

export default AddComponentForm;
