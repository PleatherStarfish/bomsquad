import { Module, ModuleFilterParams } from "../types/modules";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Filters from "./Filters";
import InfiniteScroll from "react-infinite-scroll-component";
import ModulesList from "./ModulesList";
import { useModules } from "../services/useModules";

export type FormValues = {
  search: string;
  manufacturer: string;
  component_type: string;
  category: string;
  rack_unit: string;
  mounting_style: string;
  component_groups: {
    component: string;
    component_description: string;
    min: string;
    max: string;
  }[];
};

type FilterPill = {
  key: string;
  label: string;
  text: string;
};

export const MOUNTING_STYLES = [
  { label: 'Surface Mount (SMT)', value: 'smt' },
  { label: 'Through Hole', value: 'th' },
]

const getMountingStyleLabel = (value: string) => {
  const style = MOUNTING_STYLES.find(style => style.value === value);
  return style ? style.label : value;
};

const truncate = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

const InfiniteModulesList: React.FC = () => {
  const { control, register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      search: "",
      manufacturer: "",
      component_type: "",
      category: "",
      rack_unit: "",
      mounting_style: "",
      component_groups: [{ component: "", component_description: "", min: "", max: "" }],
    },
  });

  const [filters, setFilters] = useState<ModuleFilterParams>({});
  const { data, fetchNextPage, hasNextPage, refetch } = useModules(filters);

  useEffect(() => {
    console.log(watch()); // Logs the form data
  }, [watch()]); 

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const newFilters: ModuleFilterParams = {
      search: data.search,
      manufacturer: data.manufacturer,
      component_type: data.component_type,
      category: data.category,
      rack_unit: data.rack_unit,
      mounting_style: data.mounting_style,
      component_groups: data.component_groups.map((group) => ({
        component: group.component,
        component_description: group.component_description,
        min: parseInt(group.min, 10) || 0,
        max: parseInt(group.max, 10) || 0,
      })),
    };

    setFilters(newFilters);
    await refetch();
  };

  const modules = data?.pages?.flatMap((page) => (page as { modules: Module[] }).modules) || [];

  const clearFilter = (key: keyof FormValues) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      delete newFilters[key];
      setValue(key, ""); 
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    reset();
    setFilters({});
  };

  // Prepare pill strings outside JSX
  const filterPills: FilterPill[] = Object.entries(filters)
  .flatMap(([key, value]) => {
    if (key === "component_groups" && Array.isArray(value)) {
      return value
        .map((group, index) => {
          const groupText = [
            group.component_description && `Component: ${group.component_description}`,
            group.min && `Min: ${group.min}`,
            group.max && `Max: ${group.max}`,
          ]
            .filter(Boolean)
            .join(", ");
          return groupText
            ? { key: `${key}-${index}`, label: `Component Group ${index + 1}`, text: groupText }
            : null;
        })
        .filter((pill): pill is FilterPill => pill !== null); // Filter out nulls and assert type
    } else if (value) {
      return [
        {
          key,
          label: key.replace("_", " "),
          text: Array.isArray(value) ? value.join(", ") : value,
        },
      ];
    }
    return [];
  });
  
  return (
    <div className="py-12 mx-auto">
      <Filters
        control={control}
        register={register}
        setValue={setValue}
        watch={watch}
        onSubmit={onSubmit}
      />

      <div className="flex justify-between mb-4">
        <div className="flex flex-wrap gap-2 text-xs grow">
          {filterPills.map(({ key, label, text }) => (
            <div key={key} className="flex items-center">
              <span className="mr-2 font-semibold text-gray-700">{label}:</span>
              <button
                onClick={() => clearFilter(key as keyof FormValues)}
                className="flex items-center bg-slate-500 text-white rounded-full px-3 py-0.5 font-sans font-semibold hover:bg-slate-600"
              >
                <span>{text}</span>
                <span className="ml-1 text-white hover:text-red-200">×</span>
              </button>
            </div>
          ))}
        </div>

        {filterPills.length > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 font-sans font-semibold text-white bg-[#fed703] rounded-full whitespace-nowrap"
          >
            Clear All Filters
          </button>
        )}
      </div>

      <InfiniteScroll
        dataLength={modules.length}
        next={fetchNextPage}
        hasMore={hasNextPage || false}
        loader={<p className="text-center">Loading...</p>}
      >
        <h1 className="my-6 text-3xl">Projects</h1>
        <ModulesList modules={modules} />
      </InfiniteScroll>
    </div>
  );
};

export default InfiniteModulesList;
