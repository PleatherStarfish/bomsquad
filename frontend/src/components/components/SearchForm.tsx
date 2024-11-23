import {
  Control,
  Controller,
  UseFormHandleSubmit,
  UseFormRegister,
  useWatch,
} from "react-hook-form";

import Dropdown from "../../ui/Dropdown";
import React from "react";

interface SearchFormProps {
  type: string[];
  manufacturer: string[];
  supplier: string[];
  mounting_style: string[];
  farads: string[];
  ohms: string[];
  tolerance: string[];
  voltage_rating: string[];
  register: UseFormRegister<any>;
  handleSubmit: UseFormHandleSubmit<any>;
  control: Control<any>;
  onSubmit: (data: any) => void;
}

const typesRelevantTo: Record<string, string[]> = {
  farads: ["Capacitor"],
  ohms: ["Resistor", "Photoresistor (LDR)", "Potentiometer", "Trimpot"],
  tolerance: ["Capacitor", "Resistor", "Potentiometer", "Trimpot"],
  voltage_rating: ["Resistor", "Capacitor", "Jack", "Potentiometer", "Trimpot"],
};

type Option = {
  label: string;
  value: string;
};

const renderDropdown = (
  label: string,
  name: string,
  options: (Option | string)[],
  control: Control<any>
) => (
  <div className="flex flex-col w-full" key={name}>
    <label
      className="block mb-2 font-semibold text-gray-700 text-md"
      htmlFor={name}
    >
      {label}
    </label>
    <Controller
      control={control}
      defaultValue="all"
      name={name}
      render={({ field }) => (
        <Dropdown
          options={["all", ...options]} // "all" prepended to the options array
          setValue={field.onChange}
          value={field.value}
        />
      )}
    />
  </div>
);

const SearchForm: React.FC<SearchFormProps> = ({
  type,
  manufacturer,
  supplier,
  mounting_style,
  farads,
  ohms,
  tolerance,
  voltage_rating,
  register,
  handleSubmit,
  control,
  onSubmit,
}) => {
  const currentType: string = useWatch({
    control,
    defaultValue: "",
    name: "type",
  });

  const dropdownLabelMap: Record<string, string> = {
    farads: "Farads",
    ohms: "Ohms",
    tolerance: "Tolerance",
    voltage_rating: "Voltage Ratings",
  };
  
  const dropdownValuesMap: Record<string, string[]> = {
    farads: farads,
    ohms: ohms,
    tolerance: tolerance,
    voltage_rating: voltage_rating,
  };

  const relevantDropdowns = Object.entries(typesRelevantTo)
  .filter(([_, relevantTypes]) => relevantTypes.includes(currentType))
  .map(([key]) =>
    renderDropdown(
      dropdownLabelMap[key],
      key,
      dropdownValuesMap[key].map((item) => ({
        label: item,
        value: item,
      })),
      control
    )
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6 -mx-2 w-full">
        {/* Search Input */}
        <div className="w-full px-2">
          <label
            className="block mb-2 font-semibold text-gray-700 text-md"
            htmlFor="search"
          >
            Search
          </label>
          <input
            type="text"
            {...register("search")}
            autoComplete="off"
            className="w-full h-10 pl-2 border border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500"
            id="search"
            placeholder="Search"
          />
        </div>
        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full px-2">
          {renderDropdown("Type", "type", type, control)}
          {renderDropdown(
            "Manufacturer",
            "manufacturer",
            manufacturer,
            control
          )}
          {renderDropdown("Supplier", "supplier", supplier, control)}
          {renderDropdown(
            "Mounting Style",
            "mounting_style",
            mounting_style,
            control
          )}
        </div>
        {relevantDropdowns.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-200 rounded p-6 w-full">
            {relevantDropdowns}
          </div>
        )}
        {/* Submit Button */}
        <div className="w-full px-2 md:w-1/2 lg:w-1/3">
          <button
            className="inline-flex items-center px-4 py-2 text-base font-medium text-white border border-transparent rounded-md bg-brandgreen-500 hover:bg-brandgreen-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandgreen-500"
            type="submit"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
