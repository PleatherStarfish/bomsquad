import React from "react";
import { useDropdownContext } from "./DropdownContext";

type Position = "bottom" | "left" | "right" | "top";

interface DropdownContentProps {
  children: React.ReactNode;
  position?: Position;
}

export const DropdownContent: React.FC<DropdownContentProps> = ({
  children,
  position = "bottom", // default to "bottom"
}) => {
  const { open } = useDropdownContext();

  // Define position-based styles
  const positionClasses = {
    bottom: "top-full mt-2",
    left: "left-0",
    right: "right-0",
    top: "bottom-full mb-2",
  };

  return (
    <div
      className={`absolute ${
        positionClasses[position]
      } w-48 bg-white rounded-md shadow-lg border ${
        open ? "block" : "hidden"
      }`}
    >
      {children}
    </div>
  );
};
