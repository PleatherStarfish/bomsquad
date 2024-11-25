import React from 'react';
import cx from 'classnames';

interface RadioOption {
  id: string;
  title: string;
}

interface RadioGroupProps {
  legend: string;
  legendSrOnly?: boolean; // New prop for screen-reader-only legend
  description?: string;
  options: RadioOption[];
  name: string;
  defaultSelected?: string;
  layout?: 'horizontal' | 'vertical';
  centered?: boolean;
  onChange?: (selectedId: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  legend,
  legendSrOnly = false,
  description,
  options,
  name,
  defaultSelected,
  layout = 'vertical',
  centered = false,
  onChange,
}) => {
  const handleChange = (id: string) => {
    if (onChange) {
      onChange(id);
    }
  };

  // Container classes
  const containerClass = cx('mt-4', {
    'flex space-x-4': layout === 'horizontal',
    'items-center flex flex-col': centered && layout === 'vertical',
    'justify-center': centered && layout === 'horizontal',
    'space-y-4': layout === 'vertical',
  });

  return (
    <fieldset>
      <legend className={cx('text-sm font-semibold text-gray-900', { 'sr-only': legendSrOnly })}>
        {legend}
      </legend>
      {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      <div className={containerClass}>
        {options.map((option) => (
          <div className="flex items-center" key={option.id}>
            <input
              className="h-4 w-4 border-gray-300 text-[#558a6b] focus:ring-[#558a6b]"
              defaultChecked={defaultSelected === option.id}
              id={option.id}
              name={name}
              onChange={() => handleChange(option.id)}
              type="radio"
            />
            <label
              className="ml-3 block text-sm font-medium text-gray-900"
              htmlFor={option.id}
            >
              {option.title}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
