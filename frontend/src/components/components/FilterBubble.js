import React from 'react';

const FilterBubble = ({ filterName, onRemove }) => {
  return (
    <div className="inline-flex items-center p-2 mb-2 mr-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full">
      {filterName}
      <button onClick={onRemove} className="ml-2">
        <span className="text-gray-500 hover:text-gray-700">&times;</span>
      </button>
    </div>
  );
};

export default FilterBubble;