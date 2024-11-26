import React from "react";
import { useDropdownContext } from "./DropdownContext";

interface DropdownListProps {
  children: React.ReactNode;
}

export const DropdownList: React.FC<DropdownListProps> = ({ children }) => {
  const { setOpen } = useDropdownContext();

  return (
    <ul
      className="py-1 text-sm text-gray-700"
      onClick={() => setOpen(false)} // Close dropdown on click
    >
      {children}
    </ul>
  );
};
