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
    categories: [],
    manufacturers: [],
    mounting_styles: MOUNTING_STYLES,
    rack_units: [],
  });

  const { data: filterOptions, isLoading, isError } = useFilterOptions();

  useEffect(() => {
    if (filterOptions) {
      setOptions({
        categories: filterOptions.categoryOptions?.map((c: any) => ({
          label: c.name,
          value: c.value,
        })) || [],
        manufacturers: filterOptions.manufacturers?.map((m: any) => ({
          label: m.name,
          value: m.name,
        })) || [],
        mounting_styles: MOUNTING_STYLES,
        rack_units: filterOptions.rackUnitOptions?.map((r: any) => ({
          label: r.name,
          value: r.value,
        })) || [],
      });
    }
  }, [filterOptions]);

  if (isError) return <p>Error loading data.</p>;

  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Manufacturer</label>
        <Controller
          control={control}
          name="manufacturer"
          render={({ field }) => (
            <Select
              {...field}
              isClearable
              isDisabled={isLoading}
              onBlur={field.onBlur}
              onChange={(newValue) => field.onChange(newValue?.value)}
              options={options.manufacturers}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.manufacturers.find((option) => option.value === field.value) || null}
            />
          )}
        />
      </div>

      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Mounting Style</label>
        <Controller
          control={control}
          name="mounting_style"
          render={({ field }) => (
            <Select
              {...field}
              isClearable
              isDisabled={isLoading}
              onBlur={field.onBlur}
              onChange={(newValue) => {
                field.onChange(newValue?.value)
              }}
              options={options.mounting_styles}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.mounting_styles.find((option) => option.value === field.value) || null}
            />
          )}
        />
      </div>

      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Category</label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select
              {...field}
              isClearable
              isDisabled={isLoading}
              onBlur={field.onBlur}
              onChange={(newValue) => field.onChange(newValue?.value)}
              options={options.categories}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.categories.find((option) => option.value === field.value) || null}
            />
          )}
        />
      </div>

      <div className="w-48 px-2 mb-4 min-w-[200px]">
        <label className="block mb-2 font-semibold text-gray-700 text-md">Rack Unit</label>
        <Controller
          control={control}
          name="rack_unit"
          render={({ field }) => (
            <Select
              {...field}
              isClearable
              isDisabled={isLoading}
              onBlur={field.onBlur}
              onChange={(newValue) => field.onChange(newValue?.value)}
              options={options.rack_units}
              placeholder={isLoading ? "Loading..." : "All"}
              value={options.rack_units.find((option) => option.value === field.value) || null}
            />
          )}
        />
      </div>
    </div>
  );
};

export default FilterFields;
