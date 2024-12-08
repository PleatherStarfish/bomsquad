import React from "react";
import {
  Control,
  Controller,
  UseFormHandleSubmit,
  UseFormRegister,
  useWatch,
} from "react-hook-form";
import Select from "react-select";

interface Option {
  label: string;
  value: string;
}

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

const mapToOptions = (data: string[]): Option[] => {
  return data.map((item) => ({ label: item, value: item }));
};

const SearchForm: React.FC<SearchFormProps> = ({
  type,
  manufacturer,
  supplier,
  mounting_style,
  farads,
  ohms,
  // tolerance,
  // voltage_rating,
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

  const renderDropdown = (
    label: string,
    name: string,
    options: Option[],
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
        defaultValue={null} // Default value as null to match React Select expectations
        name={name}
        render={({ field }) => (
          <Select
            isClearable
            onChange={(selectedOption) => field.onChange(selectedOption?.value)}
            options={[{ label: "All", value: "all" }, ...options]}
            value={options.find((option) => option.value === field.value)}
          />
        )}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col w-full gap-6 -mx-2">
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
        <div className="grid w-full grid-cols-1 gap-4 px-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {renderDropdown("Type", "type", mapToOptions(type), control)}
          {renderDropdown(
            "Manufacturer",
            "manufacturer",
            // @ts-ignore
            manufacturer,
            control
          )}
          {renderDropdown(
            "Supplier",
            "supplier",
            // @ts-ignore
            supplier,
            control
          )}
          {renderDropdown(
            "Mounting Style",
            "mounting_style",
            // @ts-ignore
            mounting_style,
            control
          )}
          {currentType === "Capacitor" &&
            renderDropdown("Farads", "farads", mapToOptions(farads), control)}
          {currentType === "Resistor" &&
            renderDropdown("Ohms", "ohms", mapToOptions(ohms), control)}
        </div>
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
