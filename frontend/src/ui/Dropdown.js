import React from "react";
import Select from "react-select";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "#548a6a" : provided.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px #548a6a" : provided.boxShadow,
    "&:hover": {
      borderColor: state.isFocused ? "#548a6a" : provided.borderColor,
    },
  }),
  menuPortal: provided => ({ ...provided, zIndex: 9999 }),
  menu: provided => ({ ...provided, zIndex: 9999 }),
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
  multiValue: (provided) => {
    return { ...provided, backgroundColor: "#548a6a" };
  },
  multiValueLabel: (provided) => {
    return { ...provided, color: "white" };
  },
};

const Dropdown = ({
  options,
  value,
  setValue,
  labelFormat = "title",
}) => {
  const formatLabel = (label) => {
    if (labelFormat === "starting") {
      return label.charAt(0).toUpperCase() + label.slice(1);
    } else {
      // default to 'title' case
      return label
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
  };

  const selectOptions = options.map((option) => typeof option == "string" ? ({
      value: option,
      label: formatLabel(option),
    }) : option);

  return (
    <Select
      styles={customStyles}
      className="min-w-[200px] z-30"
      menuPosition={'fixed'} 
      menuPortalTarget={document.body} 
      value={selectOptions.find((option) => option.value === value)}
      onChange={(selectedOption) => setValue(selectedOption.value)}
      options={selectOptions}
    />
  );
};

export default Dropdown;
