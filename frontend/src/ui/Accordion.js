import React, { useState } from 'react';

import { ChevronDownIcon } from "@heroicons/react/20/solid";

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={`flex items-center w-full py-2 space-x-1 font-medium text-left text-gray-900 focus:outline-none ${isOpen ? 'justify-between' : 'justify-start'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4>{title}</h4>
        <div className="flex flex-col justify-center h-full">
          <ChevronDownIcon
            className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </button>
      <div className={`transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'} overflow-y-auto`}>
          {children}
      </div>
    </>
  );
};

export default Accordion;