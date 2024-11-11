import React, { useEffect, useState } from 'react';

import { Controller } from 'react-hook-form';
import { MOUNTING_STYLES } from "./InfiniteModulesList"
import Select from 'react-select';
import useFilterOptions from '../services/useFilterOptions'; // Assuming this custom hook fetches data

interface SelectOption {
  label: string;
  value: string;
}

interface FilterOptions {
  manufacturers: SelectOption[];
  categories: SelectOption[];
  rack_units: SelectOption[];
  mounting_styles: SelectOption[];
}

const FilterFields: React.FC<{ control: any }> = ({ control }) => {
  // State to hold dynamic options with proper typing
  const [options, setOptions] = useState<FilterOptions>({
    manufacturers: [],
    categories: [],
    rack_units: [],
    mounting_styles: MOUNTING_STYLES,
  });

  const { data: filterOptions, isLoading, isError } = useFilterOptions();

  useEffect(() => {
    if (filterOptions) {
      setOptions({
        manufacturers: filterOptions.manufacturers?.map((m: any) => ({
          label: m.name,
          value: m.name,
        })) || [],
        categories: filterOptions.categoryOptions?.map((c: any) => ({
          label: c.name,
          value: c.value,
        })) || [],
        rack_units: filterOptions.rackUnitOptions?.map((r: any) => ({
          label: r.name,
          value: r.value,
        })) || [],
        mounting_styles: MOUNTING_STYLES,
      });
    }
  }, [filterOptions]);

  if (isError) return <p>Error loading data.</p>;

  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Manufacturer</label>
        <Controller
          name="manufacturer"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={options.manufacturers}
              isClearable
              isDisabled={isLoading}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.manufacturers.find((option) => option.value === field.value) || null}
              onChange={(newValue) => field.onChange(newValue?.value)}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Mounting Style</label>
        <Controller
          name="mounting_style"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={options.mounting_styles}
              isClearable
              isDisabled={isLoading}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.mounting_styles.find((option) => option.value === field.value) || null}
              onChange={(newValue) => {
                console.log(newValue)
                field.onChange(newValue?.value)
              }}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Category</label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={options.categories}
              isClearable
              isDisabled={isLoading}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.categories.find((option) => option.value === field.value) || null}
              onChange={(newValue) => field.onChange(newValue?.value)}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>

      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Rack Unit</label>
        <Controller
          name="rack_unit"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={options.rack_units}
              isClearable
              isDisabled={isLoading}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.rack_units.find((option) => option.value === field.value) || null}
              onChange={(newValue) => field.onChange(newValue?.value)}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
    </div>
  );
};

export default FilterFields;
