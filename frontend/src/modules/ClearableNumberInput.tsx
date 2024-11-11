import React from "react";

interface ClearableNumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
}

const ClearableNumberInput: React.FC<ClearableNumberInputProps> = ({
  value,
  onChange,
  placeholder = "Enter a number",
  min,
  max,
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Allow only empty input or numeric values
    if (newValue === "" || /^[0-9]+$/.test(newValue)) {
      const numericValue = newValue === "" ? undefined : Number(newValue);

      // Apply min/max validation if numericValue is a number
      if (
        numericValue === undefined ||
        (typeof numericValue === "number" &&
          (min === undefined || numericValue >= min) &&
          (max === undefined || numericValue <= max))
      ) {
        onChange(newValue);
      }
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`${className} w-20 h-8 px-2 border border-gray-300 rounded-md`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="text-gray-500 hover:text-red-500"
          aria-label="Clear number input"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ClearableNumberInput;
