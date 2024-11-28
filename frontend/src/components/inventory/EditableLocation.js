import Button from "../../ui/Button";
import ControlledInput from "../ControlledInput";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Pill from "../../ui/Pill";
import React from "react";

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
  showSeparateLocationsWithCommas = true,
  textSize = "",
}) => {

  const filteredLocation = row.location ? row.location.filter(Boolean) : [];

  return (
    <div className="flex justify-between w-full">
      {row.id === locationIdToEdit ? (
        <div className="flex flex-col">
          <div className="flex gap-1.5 pb-1 pt-6">
            <form
              className="flex content-center w-full gap-1"
              onSubmit={(e) => e.preventDefault()}
            >
              <ControlledInput
                className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
                onChange={(e) => handleLocationChange(e)}
                type="text"
                value={updatedLocationToSubmit ?? row.location}
              />
              <Button
                onClick={() => setLocationIdToEdit(undefined)}
                variant="muted"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleSubmitLocation(row.id)}
                type="submit"
                variant="primary"
              >
                Update
              </Button>
            </form>
          </div>
          {showSeparateLocationsWithCommas && (
            <p className="text-xs text-gray-500">Separate locations with commas.</p>
          )}
        </div>
      ) : (
        <ul className="flex flex-wrap w-full">
          {filteredLocation.length > 0 ? (
            filteredLocation.map((item, index) => (
              <Pill
                key={index}
                onClick={() => handlePillClick(row.id, index)}
                showArrow={index !== filteredLocation.length - 1}
                textSize={textSize}
              >
                {item}
              </Pill>
            ))
          ) : (
            <li className="text-gray-500">-</li>
          )}
        </ul>
      )}
      {row.id !== locationIdToEdit && (
        <div
          className="flex flex-col justify-center"
          onClick={() => {
            setLocationIdToEdit(row.id);
            handleClick(
              row,
              "location",
              locationIdToEdit,
              setLocationIdToEdit,
              setUpdatedLocationToSubmit
            );
          }}
          role="button"
        >
          <PencilSquareIcon className="w-4 h-4 stroke-slate-300 hover:stroke-pink-500" />
        </div>
      )}
    </div>
  );
};

export default EditableLocation;
