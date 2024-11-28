import React, { ReactNode } from "react";
import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";

interface HeaderWithButtonProps {
  title: string;
  onButtonClick: () => void;
  buttonText: string;
  icon?: ReactNode; // Allow passing a custom icon
}

const HeaderWithButton: React.FC<HeaderWithButtonProps> = ({
  title,
  onButtonClick,
  buttonText,
  icon = <ArrowDownOnSquareIcon className="w-5 h-5" />, // Default to ArrowDownOnSquareIcon
}) => {
  return (
    <div className="mb-6 relative">
      {/* Divider Line */}
      <div aria-hidden="true" className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>

      {/* Title and Button */}
      <div className="relative flex items-center justify-between">
        <h1 className="bg-white pr-3 text-3xl font-semibold text-gray-900 font-display">
          {title}
        </h1>
        <button
          className="inline-flex items-center gap-x-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:text-white hover:bg-[#4f7f63] transition-all"
          onClick={onButtonClick}
          type="button"
        >
          {icon}
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
};

export default HeaderWithButton;
