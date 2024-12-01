import React, { useCallback, useState } from "react";
import AsyncSelect from "react-select/async";
import debounce from "lodash/debounce";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface ComponentOption {
  value: string;
  label: string;
}

interface AsyncComponentSelectProps {
  placeholder?: string;
  onChange: (selected: ComponentOption | null) => void;
  value?: ComponentOption | null;
}

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

export const useComponentAutocomplete = (inputValue: string) => {
  return useQuery({
    enabled: Boolean(inputValue && inputValue.length >= 2),
    queryFn: () => fetchComponentOptions(inputValue),
    queryKey: ["components-autocomplete", inputValue],
  });
};

const AsyncComponentSelect: React.FC<AsyncComponentSelectProps> = ({
  placeholder = "Search components...",
  onChange,
  value,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: componentOptions = [], isLoading } = useComponentAutocomplete(searchTerm);

  const debouncedLoadOptions = useCallback(
    debounce((inputValue: string, callback: (options: ComponentOption[]) => void) => {
      setSearchTerm(inputValue);
      callback(componentOptions);
    }, 200),
    [componentOptions]
  );

  return (
    <AsyncSelect
      cacheOptions
      className="w-full h-10"
      isLoading={isLoading}
      loadOptions={debouncedLoadOptions}
      menuPortalTarget={document.body}
      menuPosition="fixed"
      onChange={onChange}
      placeholder={placeholder}
      styles={{
        menu: (provided) => ({
          ...provided,
          maxHeight: 200,
          overflowY: "auto",
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      }}
      value={value}
    />
  );
};

export default AsyncComponentSelect;
