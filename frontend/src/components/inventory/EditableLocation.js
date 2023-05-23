import React from "react";
import Button from "../../ui/Button";
import Pill from "../../ui/Pill";
import ControlledInput from "../ControlledInput";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

const EditableLocation = ({
    row,
    locationIdToEdit,
    updatedLocationToSubmit,
    handleLocationChange,
    setLocationIdToEdit,
    handleSubmitLocation,
    handlePillClick,
    handleClick,
    setUpdatedLocationToSubmit,
  }) => {
    return (
      <div className="flex justify-between w-full">
        {row.component.id === locationIdToEdit ? (
          <div className="flex flex-col">
            <div className="flex gap-1.5 pb-1 pt-6">
              <form
                className="flex content-center w-full gap-1"
                onSubmit={(e) => e.preventDefault()}
              >
                <ControlledInput
                  type="text"
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
                  value={updatedLocationToSubmit ?? row.location}
                  onChange={(e) => handleLocationChange(e)}
                />
                <Button
                  variant="muted"
                  onClick={() => setLocationIdToEdit(undefined)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={() => handleSubmitLocation(row.component.id)}
                >
                  Update
                </Button>
              </form>
            </div>
            <p className="text-xs text-gray-500">
              Separate locations with commas.
            </p>
          </div>
        ) : (
          <ul className="flex flex-wrap w-full">
            {row.location
              ? row.location.map((item, index) => (
                  <Pill
                    key={index}
                    showArrow={index !== row.location.length - 1}
                    onClick={() => handlePillClick(row.component.id, index)}
                  >
                    {item}
                  </Pill>
                ))
              : "-"}
          </ul>
        )}
        {row.component.id !== locationIdToEdit && (
          <div
            className="flex flex-col justify-center"
            onClick={() =>
              handleClick(
                row,
                "location",
                locationIdToEdit,
                setLocationIdToEdit,
                setUpdatedLocationToSubmit
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

export default EditableLocation;
