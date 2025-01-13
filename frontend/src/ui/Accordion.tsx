import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";

import { useState } from "react";

import cx from "classnames";
import React from "react";

interface AccordionProps {
  backgroundColor?: string; // Optional background color class
  title: string; // Title displayed in the header
  headerClasses?: string; // Additional classes for the header
  borderColor?: string; // Border color class
  bgColor?: string; // Background color for the content
  rounded?: boolean; // Whether the header and content are rounded
  innerPadding?: string; // Padding inside the content
  children: ReactNode; // Content of the accordion
}

const Accordion: React.FC<AccordionProps> = ({
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
          `flex items-center w-full py-2 space-x-1 font-medium text-left text-gray-900 px-4 focus:outline-none ${
            isOpen ? "justify-between" : "justify-start"
          }`,
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
            className={`h-6 w-6 transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </button>
      <div
        className={cx(
          "transition-all duration-300 overflow-y-auto",
          { "max-h-0": !isOpen, "max-h-48": isOpen },
          rounded && "rounded",
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
