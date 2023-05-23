import { Controller, useWatch } from "react-hook-form";

import Dropdown from "../../ui/Dropdown";
import React from "react";

const typesRelevantTo = {
  farads: ["Capacitor"],
  ohms: ["Resistor", "Photoresistor (LDR)", "Potentiometer", "Trimpot"],
  tolerance: ["Capacitor", "Resistor", "Potentiometer", "Trimpot"],
  voltage_rating: [
    "Resistor",
    "Capacitor",
    "Jack",
    "Potentiometer",
    "Trimpot",
  ],
};

const SearchForm = ({
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
    defaultValue: "",
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
          {renderDropdown("Type", "type", type)}
          {renderDropdown("Manufacturer", "manufacturer", manufacturer)}
          {renderDropdown("Supplier", "supplier", supplier)}
          {renderDropdown("Mounting style", "mounting_style", mounting_style)}

          {typesRelevantTo.farads.includes(currentType) &&
            renderDropdown("Farads", "farads", farads)}
          {typesRelevantTo.ohms.includes(currentType) &&
            renderDropdown("Ohms", "ohms", ohms)}
          {typesRelevantTo.tolerance.includes(currentType) &&
            renderDropdown("Tolerance", "tolerance", tolerance)}
          {typesRelevantTo.voltage_rating.includes(currentType) &&
            renderDropdown(
              "Voltage ratings",
              "voltage_rating",
              voltage_rating
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
