import React from "react";
import { useDropdownContext } from "./DropdownContext";

interface DropdownButtonProps {
  children: React.ReactNode;
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({ children }) => {
  const { open, setOpen } = useDropdownContext();

  return (
    <button
      className="px-4 py-1.5 font-medium text-white bg-[#3c82f6] hover:bg-blue-700 rounded-md flex items-center"
      onClick={() => setOpen(!open)}
    >
      {children}
      <svg
        aria-hidden="true"
        className={`w-4 h-4 ml-2 transition-transform ${
          open ? "rotate-180" : "rotate-0"
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 9l-7 7-7-7"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </svg>
    </button>
  );
};
