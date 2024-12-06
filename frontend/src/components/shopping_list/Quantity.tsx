import React from "react";
import { get } from "lodash";

interface Component {
  quantity: number;
}

interface QuantityProps {
  componentId: string;
  componentsInModule?: Record<string, Component[]>;
  pencilComponent?: React.ReactNode;
  hideInteraction?: boolean;
}

const Quantity: React.FC<QuantityProps> = ({
  componentId,
  componentsInModule = [],
  pencilComponent,
  hideInteraction,
}) => {
  const compsForModuleThatMatchRow = get(componentsInModule, componentId, []);
  const totalQuantity = compsForModuleThatMatchRow.reduce(
    (acc, obj) => acc + obj.quantity,
    0
  );

  return totalQuantity ? (
    <>
      <span className="font-bold">{totalQuantity}</span>
      {hideInteraction ? null : pencilComponent}
    </>
  ) : null;
};

export default Quantity;
