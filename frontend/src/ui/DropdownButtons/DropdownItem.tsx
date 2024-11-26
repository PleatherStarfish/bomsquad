import React from "react";

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
}) => {
  return (
    <li>
      <button
        className="block px-4 py-2 w-full text-left hover:bg-gray-100"
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
};
