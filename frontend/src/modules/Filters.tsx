import {
  Control,
  Controller,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  useFieldArray,
} from "react-hook-form";
import React, { useCallback, useState } from "react";

import Accordion from "../ui/Accordion";
import AsyncSelect from "react-select/async";
import ClearableNumberInput from "./ClearableNumberInput";
import FilterFields from "./FilterFields";
import { FormValues } from "./InfiniteModulesList";
import { TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import debounce from "lodash/debounce";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useWatch } from "react-hook-form";

const scaleInWithDelay = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeIn",
    },
  },
};

type FiltersProps = {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  onSubmit: (data: FormValues) => void;
};

interface ComponentOption {
  value: string;
  label: string;
}

// API call to fetch component options
const fetchComponentOptions = async (inputValue: string): Promise<ComponentOption[]> => {
  const response = await axios.get("/api/components-autocomplete/", {
    params: { q: inputValue },
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
  });
  return response.data.results.map((item: { id: string; text: string }) => ({
    label: item.text,
    value: item.id,
  }));
};

// Custom hook to use React Query for fetching options
export const useComponentAutocomplete = (inputValue: string) => {
  return useQuery({
    enabled: inputValue.length >= 2,
    queryFn: () => fetchComponentOptions(inputValue),
    queryKey: ["components-autocomplete", inputValue], // Only fetch when there is input
  });
};

const Filters: React.FC<FiltersProps> = ({
  control,
  register,
  setValue,
  watch,
  onSubmit,
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "component_groups",
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Fetch component options with React Query using the current search term
  const { data: componentOptions = [], isLoading } = useComponentAutocomplete(searchTerm);

  // Watch min and max fields separately in a map
  const minValues = fields.map((_, index) =>
    useWatch({ control, name: `component_groups.${index}.min` as const })
  );

  const maxValues = fields.map((_, index) =>
    useWatch({ control, name: `component_groups.${index}.max` as const })
  );

  // Debounced function for loading options
  const debouncedLoadOptions = useCallback(
    debounce((inputValue: string, callback: (options: ComponentOption[]) => void) => {
      setSearchTerm(inputValue);
      callback(componentOptions);
    }, 200), // 200ms delay
    [componentOptions]
  );

  // Custom onChange handlers for min and max inputs
  const handleMinChange = (index: number, value: string) => {
    const max = maxValues[index] || "";
    if (value !== "" && parseInt(value) > parseInt(max || "Infinity")) {
      setValue(`component_groups.${index}.max`, value);
    }
  };

  const handleMaxChange = (index: number, value: string) => {
    const min = minValues[index] || "";
    if (value !== "" && parseInt(value) < parseInt(min || "0")) {
      setValue(`component_groups.${index}.min`, value);
    }
  };

  return (
    <motion.div
      animate="visible"
      className="p-10 mb-5 bg-gray-100 rounded-lg"
      initial="hidden"
      variants={scaleInWithDelay}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(watch());
        }}
      >
        <div className="flex flex-col gap-6 -mx-2">
          <div className="w-full px-2 mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-md">
              Search
            </label>
            <input
              {...register("search")}
              className="w-full h-10 pl-2 border border-gray-300 rounded-md"
              placeholder="Search"
              type="text"
            />
          </div>

          <FilterFields control={control} />

          <div className="px-2">
            <Accordion
              bgColor="bg-gray-50"
              borderColor="border-gray-300"
              innerPadding="p-4"
              rounded={false}
              title="Advanced"
            >
              <div className="flex flex-col w-full space-y-8" id="components-container">
                {fields.map((field, index) => {
                  const minValue = watch(`component_groups.${index}.min`);
                  const maxValue = watch(`component_groups.${index}.max`);

                  return (
                    <React.Fragment key={field.id}>
                      <div className="component-group">
                        <label className="block mb-2 font-semibold text-gray-700 text-md">{`Component [${
                          index + 1
                        }]`}</label>
                        <AsyncSelect
                          cacheOptions
                          className="w-full h-10"
                          isLoading={isLoading}
                          loadOptions={debouncedLoadOptions}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          onChange={(selected) =>
                            setValue(`component_groups.${index}`, {
                              component: selected?.value || "",
                              component_description: selected?.label || "",
                              max: maxValue || "",
                              min: minValue || "",
                            })
                          }
                          placeholder="Search components..."
                          styles={{
                            menu: (provided) => ({
                              ...provided,
                              maxHeight: 200,
                              overflowY: "auto",
                            }),
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                        />
                        <div className="flex items-center w-full gap-4 mt-2">
                          <label className="text-sm font-semibold text-gray-700">
                            Quantity:
                          </label>
                          <Controller
                            control={control}
                            defaultValue=""
                            name={`component_groups.${index}.min`}
                            render={({ field: { onChange, value } }) => (
                              <ClearableNumberInput
                                className="w-20 h-8 px-2 border border-gray-300 rounded-md"
                                max={maxValue ? parseInt(maxValue) : undefined}
                                min={0}
                                onChange={(newValue) => {
                                  onChange(newValue);
                                  handleMinChange(index, newValue);
                                }}
                                placeholder="Min"
                                value={value || ""}
                              />
                            )}
                          />

                          <span className="text-sm font-semibold text-gray-700">
                            to
                          </span>

                          <Controller
                            control={control}
                            defaultValue=""
                            name={`component_groups.${index}.max`}
                            render={({ field: { onChange, value } }) => (
                              <ClearableNumberInput
                                className="w-20 h-8 px-2 border border-gray-300 rounded-md"
                                min={minValue ? parseInt(minValue) : 0}
                                onChange={(newValue) => {
                                  onChange(newValue);
                                  handleMaxChange(index, newValue);
                                }}
                                placeholder="Max"
                                value={value || ""}
                              />
                            )}
                          />
                          <div className="flex justify-end w-full pr-2 grow-1">
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => remove(index)}
                              type="button"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <hr />
                    </React.Fragment>
                  );
                })}
                <button
                  className="w-8 h-8 text-gray-700 transition duration-150 ease-in-out bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() =>
                    append({
                      component: "",
                      component_description: "",
                      max: "",
                      min: "",
                    })
                  }
                  type="button"
                >
                  +
                </button>
              </div>
            </Accordion>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button
              className="inline-flex items-center px-4 py-2 ml-2 text-base font-medium text-white rounded-md bg-brandgreen-500 hover:bg-brandgreen-600"
              type="submit"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default Filters;
