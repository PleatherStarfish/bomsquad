import React, { useState } from 'react';

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import cx from 'classnames';

const Accordion = ({
  backgroundColor = "", 
  title, 
  headerClasses = "", 
  borderColor = "",
  bgColor = "bg-white",
  rounded = true,
  innerPadding = "",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={cx(
          `flex items-center w-full py-2 space-x-1 font-medium text-left text-gray-900 px-4 focus:outline-none ${isOpen ? 'justify-between' : 'justify-start'}`,
          rounded && "rounded", 
          borderColor && "border-b",
          backgroundColor,
          borderColor
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className={cx("grow", headerClasses)}>{title}</h4>
        <div className="flex flex-col justify-center h-full">
          <ChevronDownIcon
            className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
          />
        </div>
      </button>
      <div 
        className={cx(
          "transition-all duration-300 overflow-y-auto rounded",
          {"max-h-48": isOpen, "max-h-0": !isOpen},
          bgColor,
          isOpen && innerPadding
        )}
      >
        {children}
      </div>
    </>
  );
};

export default Accordion;
