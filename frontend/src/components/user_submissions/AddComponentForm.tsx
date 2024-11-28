import React from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import Select, { GroupBase, OptionsOrGroups } from "react-select";
import {
  AddComponentFormInputs,
} from "../../types/createComponentForm";
import {
  useGetComponentDropdownOptions,
  useCreateComponent,
} from "../../services/useCreateComponent";
import Alert from "../../ui/Alert";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import SupplierItems from "./SupplierItems";

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
      required: "Tolerance is required",
      validate: (value: string | undefined) =>
        (value !== undefined &&
          /^(\+\/-|\+|-|\+-|-+)?\d+(\.\d+)?%$/.test(value)) ||
        "Invalid tolerance format (e.g., '+5%', '+/-10%', '-+3%')",
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
      required: "Voltage rating is required",
      validate: (value: string | undefined) =>
        (value !== undefined && /^\d+(\.\d+)?(V|kV|mV)$/.test(value)) ||
        "Invalid voltage rating format (e.g., '5V', '0.3kV', '120mV')",
    },
  },
};

const transformSubmissionData = (data) => {
  const extractValue = (field) => (field && field.value ? field.value : field);

  return {
    component: {
      farads: data.farads || null,
      farads_unit: extractValue(data.farads_unit),
      manufacturer: extractValue(data.manufacturer),
      manufacturer_part_no: data.manufacturer_part_no,
      mounting_style: extractValue(data.mounting_style),
      tolerance: data.tolerance || null,
      type: extractValue(data.type),
      voltage_rating: data.voltage_rating || null, // Ensure null if not provided
    },
    supplier_items: data.supplier_items.map((item) => ({
      currency: item.currency,
      link: item.link || "", // Default to empty string if missing
      pcs: item.pcs ? parseInt(item.pcs, 1) : null,
      price: parseFloat(item.price || 0), // Ensure valid float
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
};

const AddComponentForm: React.FC<{ onClickSubmit: () => void }> = () => {
  const {
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
  console.log(dropdownOptions);
  const createComponentMutation = useCreateComponent();

  const onSubmit = (data: AddComponentFormInputs) => {
    console.log("data1", data);
    if (!data.supplier_items || data.supplier_items.length === 0) {
      setError("supplier_items", {
        message: "At least one supplier item is required.",
        type: "manual",
      });
      return;
    }

    const transformedData = transformSubmissionData(data);

    console.log("transformedData", transformedData);

    createComponentMutation.mutate(transformedData, {
      onError: (error: Error) => {
        alert(`Error adding component: ${error.message}`);
      },
      onSuccess: () => {
        alert("Component successfully added!");
      },
    });
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
    <form
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* Manufacturer */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="manufacturer"
        >
          Manufacturer
        </label>
        <Controller
          control={control}
          name="manufacturer"
          render={({ field }) => (
            <Select
              {...field}
              className="react-select-container"
              classNamePrefix="react-select"
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
          Manufacturer Part No.
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
          Mounting Style
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
          Type
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
              Ohms
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
              Ohms Unit
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
              Farads
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
              Farads Unit
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
            {...register(
              "tolerance",
              isRelevant("tolerance") ? validationRules.tolerance.rules : {}
            )}
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
            {...register(
              "voltage_rating",
              isRelevant("voltage_rating")
                ? validationRules.voltage_rating.rules
                : {}
            )}
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

      <SupplierItems
        control={control}
        errors={errors}
        register={register}
        suppliers={dropdownOptions?.suppliers ?? []}
      />

      {/* Submit Button */}
      <div className="md:col-span-2 flex justify-end">
        <button
          className="mt-4 px-4 py-2 text-sm font-medium text-white bg-brandgreen-600 border border-transparent rounded-md shadow-sm hover:bg-brandgreen-700"
          type="submit"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

export default AddComponentForm;
