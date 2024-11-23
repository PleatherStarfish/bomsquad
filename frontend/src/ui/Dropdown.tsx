import Select, { ActionMeta, SingleValue, StylesConfig } from "react-select";

import React from "react";

// Define the types for options
interface Option {
  label: string;
  value: string;
}

// Define props for the Dropdown component
interface DropdownProps {
  options: (Option | string)[];
  value: string;
  setValue: (value: string) => void;
  labelFormat?: "starting" | "title";
}

// Custom styles with TypeScript types
const customStyles: StylesConfig<Option, false> = {
  control: (provided, state) => ({
    ...provided,
    "&:hover": {
      borderColor: state.isFocused ? "#548a6a" : provided.borderColor,
    },
    borderColor: state.isFocused ? "#548a6a" : provided.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px #548a6a" : provided.boxShadow,
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 }),
  menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#548a6a",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "white",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#548a6a"
      : state.isFocused
      ? "#548a6a"
      : provided.backgroundColor,
    color: state.isSelected
      ? "white"
      : state.isFocused
      ? "white"
      : provided.color,
  }),
  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1;
    const transition = "opacity 300ms";

    return { ...provided, opacity, transition };
  },
};

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  setValue,
  labelFormat = "title",
}) => {
  // Helper function to format labels
  const formatLabel = (label: string): string => {
    if (labelFormat === "starting") {
      return label.charAt(0).toUpperCase() + label.slice(1);
    } else {
      // Default to 'title' case
      return label
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  };

  // Map options to the required format
  const selectOptions: Option[] = options.map((option) =>
    typeof option === "string"
      ? { label: formatLabel(option), value: option }
      : option
  );

  return (
    <Select
      className="min-w-[200px]"
      menuPortalTarget={document.body}
      menuPosition="fixed"
      onChange={(selectedOption: SingleValue<Option>, _actionMeta: ActionMeta<Option>) => {
        if (selectedOption) {
          setValue(selectedOption.value);
        }
      }}
      options={selectOptions}
      styles={customStyles}
      value={selectOptions.find((option) => option.value === value)}
    />
  );
};

export default Dropdown;
