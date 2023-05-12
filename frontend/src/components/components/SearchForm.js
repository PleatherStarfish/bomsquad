import React from "react";
import { Controller, useWatch } from "react-hook-form";
import Dropdown from "../../ui/Dropdown";

const typesRelevantTo = {
  farads: ["capacitor"],
  ohms: ["resistor", "photoresistor_(ldr)", "potentiometer", "trimpot"],
  tolerances: ["capacitor", "resistor", "potentiometer", "trimpot"],
  voltage_ratings: [
    "resistor",
    "capacitor",
    "jack",
    "potentiometer",
    "trimpot",
  ],
};

const SearchForm = ({
  types,
  manufacturers,
  suppliers,
  mounting_style,
  farads,
  ohms,
  tolerances,
  voltage_ratings,
  register,
  handleSubmit,
  control,
  onSubmit,
}) => {
  const renderDropdown = (label, name, options) => (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className="block mb-2 font-semibold text-gray-700 text-md"
      >
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        defaultValue="all"
        render={({ field }) => (
          <Dropdown
            options={["all", ...options.filter((option) => option !== "")]}
            value={field.value}
            setValue={field.onChange}
          />
        )}
      />
    </div>
  );

  const currentType = useWatch({
    control,
    name: "type",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-6 -mx-2">
        <div className="w-full px-2 md:w-3/5 lg:w-1/2 md:mb-0">
          <label
            htmlFor="search"
            className="block mb-2 font-semibold text-gray-700 text-md"
          >
            Search
          </label>
          <input
            type="text"
            {...register("search")}
            placeholder="Search"
            id="search"
            autoComplete="off"
            className="w-full h-10 pl-2 border border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500"
          />
        </div>
        <div className="flex flex-wrap w-full gap-4 px-2">
          {renderDropdown("Type", "type", types)}
          {renderDropdown("Manufacturer", "manufacturer", manufacturers)}
          {renderDropdown("Supplier", "suppliers", suppliers)}
          {renderDropdown("Mounting style", "mounting_style", mounting_style)}

          {typesRelevantTo["farads"].includes(currentType) &&
            renderDropdown("Farads", "farads", farads)}
          {typesRelevantTo["ohms"].includes(currentType) &&
            renderDropdown("Ohms", "ohms", ohms)}
          {typesRelevantTo["tolerances"].includes(currentType) &&
            renderDropdown("Tolerance", "tolerances", tolerances)}
          {typesRelevantTo["voltage_ratings"].includes(currentType) &&
            renderDropdown(
              "Voltage ratings",
              "voltage_ratings",
              voltage_ratings
            )}
        </div>
        <div className="w-full px-2 md:w-1/2 lg:w-1/3">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 text-base font-medium text-white border border-transparent rounded-md bg-brandgreen-500 hover:bg-brandgreen-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandgreen-500"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default SearchForm;
