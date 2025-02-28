import React, { useEffect, useState } from "react";
import cx from "classnames";
import { UseQueryResult } from "@tanstack/react-query";

// Define the Types constant
export const Types = {
  INVENTORY: "inventory",
  SHOPPING: "shopping",
  SHOPPING_ANON: "shopping_anon",
} as const;

// Define the prop types
interface QuantityProps {
  useHook: (...args: any[]) => UseQueryResult<number, Error>;
  hookArgs: Record<string, any>;
  replaceZero?: boolean;
  classNames?: string;
  hideLoadingTag?: boolean;
}

const Quantity: React.FC<QuantityProps> = ({
  useHook,
  hookArgs,
  replaceZero = true,
  classNames = "",
  hideLoadingTag = false,
}) => {
  const [quantity, setQuantity] = useState<number | undefined>();
  const { data, isLoading, error } = useHook(...Object.values(hookArgs));

  useEffect(() => {
    setQuantity(data);
  }, [data]);

  if (isLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">
        {hideLoadingTag ? "-" : "Loading..."}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error: {error?.message || "An unknown error occurred"}
      </div>
    );
  }

  return (
    <span
      className={cx(
        "font-bold",
        classNames,
        { "text-[#548a6a]": quantity !== 0 },
        { "text-gray-500": quantity === 0 }
      )}
    >
      {quantity === 0 && replaceZero ? "-" : quantity}
    </span>
  );
};

export default Quantity;
