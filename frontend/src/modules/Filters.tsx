import { Control, UseFormRegister, UseFormSetValue, UseFormWatch, useFieldArray } from "react-hook-form";

import Accordion from "../ui/Accordion";
import AsyncSelect from "react-select/async";
import FilterFields from "./FilterFields";
import { FormValues } from "./InfiniteModulesList";
import React from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import axios from "axios";

type FiltersProps = {
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  watch: UseFormWatch<FormValues>;
  onSubmit: (data: FormValues) => void;
};

// Define the option type for AsyncSelect
interface ComponentOption {
  value: string; // UUID of the component
  label: string; // Description of the component
}

const Filters: React.FC<FiltersProps> = ({ control, register, setValue, watch, onSubmit }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "component_groups",
  });

  const loadOptions = async (inputValue: string): Promise<ComponentOption[]> => {
    try {
      const response = await axios.get('/api/components-autocomplete/', {
        params: { q: inputValue },
        xsrfCookieName: 'csrftoken',
        xsrfHeaderName: 'X-CSRFToken',
      });
      return response.data.results.map((item: { id: string; text: string }) => ({
        value: item.id,
        label: item.text,
      }));
    } catch (error) {
      console.error("Error fetching autocomplete options:", error);
      return [];
    }
  };

  return (
    <div className="p-10 mb-10 bg-gray-100 rounded-lg">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(watch());
        }}
      >
        <div className="flex flex-col gap-6 -mx-2">
          <div className="w-full px-2 mb-6">
            <label className="block mb-2 font-semibold text-gray-700 text-md">Search</label>
            <input
              {...register("search")}
              type="text"
              placeholder="Search"
              className="w-full h-10 pl-2 border border-gray-300 rounded-md"
            />
          </div>

          <FilterFields control={control} />

          <div className="px-2">
            <Accordion
              borderColor="border-gray-300"
              title="Advanced"
              innerPadding="p-4"
              bgColor="bg-gray-50"
              rounded={false}
            >
              <div id="components-container" className="flex flex-col w-full space-y-8">
                {fields.map((field, index) => (
                  <React.Fragment key={field.id}>
                    <div className="component-group">
                      <label className="block mb-2 font-semibold text-gray-700 text-md">{`Component [${index + 1}]`}</label>
                      <AsyncSelect<ComponentOption>
                        cacheOptions
                        loadOptions={loadOptions}
                        onChange={(selected: ComponentOption | null) =>
                          setValue(`component_groups.${index}`, {
                            component: selected?.value || "",
                            component_description: selected?.label || "",
                            min: watch(`component_groups.${index}.min`),
                            max: watch(`component_groups.${index}.max`),
                          })
                        }
                        placeholder="Search components..."
                        className="w-full h-10"
                        menuPortalTarget={document.body}
                        menuPosition="fixed"
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          menu: (provided) => ({ ...provided, maxHeight: 200, overflowY: "auto" }),
                        }}
                      />
                      <div className="flex items-center w-full gap-4 mt-2">
                        <label className="text-sm font-semibold text-gray-700">Quantity:</label>
                        <input
                          {...register(`component_groups.${index}.min` as const)}
                          type="number"
                          min={0}
                          placeholder="Min"
                          className="w-20 h-8 px-2 border border-gray-300 rounded-md"
                        />
                        <span className="text-sm font-semibold text-gray-700">to</span>
                        <input
                          {...register(`component_groups.${index}.max` as const)}
                          type="number"
                          min={0}
                          placeholder="Max"
                          className="w-20 h-8 px-2 border border-gray-300 rounded-md"
                        />
                        <div className="flex justify-end w-full pr-2 grow-1">
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <hr />
                  </React.Fragment>
                ))}
                <button
                  type="button"
                  onClick={() => append({ component: "", component_description: "", min: "", max: "" })}
                  className="w-8 h-8 text-gray-700 transition duration-150 ease-in-out bg-gray-300 rounded hover:bg-gray-400"
                >
                  +
                </button>
              </div>
            </Accordion>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 text-base font-medium text-white rounded-md bg-brandgreen-500 hover:bg-brandgreen-600"
            >
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Filters;
