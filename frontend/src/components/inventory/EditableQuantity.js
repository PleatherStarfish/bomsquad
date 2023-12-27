import React from "react";
import NumericInput from "react-numeric-input";
import Button from "../../ui/Button";
import {
  PencilSquareIcon,
  ArrowPathIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const EditableQuantity = ({
  row,
  quantityIdToEdit,
  updatedQuantityToSubmit,
  handleQuantityChange,
  handleSubmitQuantity,
  setQuantityIdToEdit,
  setUpdatedQuantityToSubmit,
  handleClick,
}) => {
  const { id, quantity } = row;

  return (
    <div className="flex content-center justify-between w-full">
      {id === quantityIdToEdit ? (
        <div>
          <form
            className="flex content-center w-full gap-1"
            onSubmit={(e) => e.preventDefault()}
          >
            <NumericInput
              className="block w-16 rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
              type="number"
              value={updatedQuantityToSubmit ?? quantity}
              onChange={(e) => handleQuantityChange(e)}
            />
            <div className="flex justify-around gap-1">
              <Button
                className="h-full"
                variant="muted"
                size="xs"
                iconOnly
                Icon={XMarkIcon}
                onClick={() => {
                  setQuantityIdToEdit(undefined);
                  setUpdatedQuantityToSubmit(undefined);
                }}
              >
                Cancel
              </Button>
              <Button
                className="h-full"
                variant="primary"
                size="xs"
                iconOnly
                Icon={ArrowPathIcon}
                onClick={() => handleSubmitQuantity(id)}
              >
                Update
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <span className="font-bold">{quantity}</span>
      )}
      {id !== quantityIdToEdit && (
        <div
          onClick={() =>
            handleClick(
              row,
              "quantity",
              quantityIdToEdit,
              setQuantityIdToEdit,
              setUpdatedQuantityToSubmit
            )
          }
          role="button"
        >
          <PencilSquareIcon className="w-4 h-4 stroke-slate-300 hover:stroke-pink-500" />
        </div>
      )}
    </div>
  );
};

export default EditableQuantity;