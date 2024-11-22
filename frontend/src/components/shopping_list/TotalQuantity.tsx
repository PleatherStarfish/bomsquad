import React from "react";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity";

interface TotalQuantityProps {
  componentId: string;
}

const TotalQuantity: React.FC<TotalQuantityProps> = ({ componentId }) => {
  const { data: quantityInInventoryAnon } =
    useGetUserAnonymousShoppingListQuantity(componentId);

  return quantityInInventoryAnon ? (
    <span className="font-bold">{quantityInInventoryAnon}</span>
  ) : null; // Use null for "render nothing"
};

export default TotalQuantity;
