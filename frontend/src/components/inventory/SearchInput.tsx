import React from "react";

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <input
      className="block w-full rounded-md border-0 p-2 h-[32px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
      id="search"
      name="search"
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search"
      type="text"
      value={searchTerm}
    />
  );
};

export default SearchInput;
