import { createContext, useContext } from "react";

interface DropdownContextType {
  open: boolean;
  setOpen: (state: boolean) => void;
}

export const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const useDropdownContext = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdownContext must be used within a DropdownProvider");
  }
  return context;
};
