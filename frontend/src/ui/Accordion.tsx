/* eslint-disable sort-keys */
import React, { useState, ReactNode } from "react";
import { ChevronDownIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import cx from "classnames";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

interface AccordionProps {
  title: ReactNode | string;
  children: ReactNode;
  backgroundColor?: string;
  borderColor?: string;
  rounded?: boolean;
  innerPadding?: string;
  isOpenByDefault?: boolean;
  notice?: string; // Optional notice for the info badge
  infoIcon?: boolean; // Whether to show the info badge
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  backgroundColor = "bg-gray-100",
  borderColor = "border border-gray-300",
  rounded = true,
  innerPadding = "p-4",
  isOpenByDefault = false,
  notice,
  infoIcon = false,
}) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);

  return (
    <div
      className={cx(
        "transition-all duration-300 overflow-hidden",
        backgroundColor,
        borderColor,
        rounded && "rounded-md"
      )}
    >
      <button
        className={cx(
          "w-full flex justify-between items-center py-2 px-4 focus:outline-none",
          backgroundColor
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-800">{title}</h4>
          {infoIcon && notice && (
            <Tippy content={<span className="text-sm">{notice}</span>}>
              <InformationCircleIcon className="w-5 h-5 text-gray-500 hover:text-gray-700" />
            </Tippy>
          )}
        </div>
        <ChevronDownIcon
          className={`h-5 w-5 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>
      <div
        className={cx(
          "transition-all duration-300",
          { "max-h-0": !isOpen, "max-h-[400px]": isOpen }, // Adjust max height as needed
          isOpen && innerPadding
        )}
        style={{ overflowY: "hidden" }}
      >
        {isOpen && children}
      </div>
    </div>
  );
};

export default Accordion;
