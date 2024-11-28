import React from "react";

interface FilterBubbleProps {
  filterName: string;
  onRemove: () => void;
}

const FilterBubble: React.FC<FilterBubbleProps> = ({ filterName, onRemove }) => {
  return (
    <div className="inline-flex items-center p-2 mb-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full">
      {filterName}
      <button className="ml-2" onClick={onRemove}>
        <span className="text-gray-500 hover:text-gray-700">&times;</span>
      </button>
    </div>
  );
};

export default FilterBubble;
