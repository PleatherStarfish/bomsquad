import Button from "../../ui/Button";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Pill from "../../ui/Pill";
import React from "react";

const SimpleEditableLocation = ({
  locationArray,
  isEditable,
  setIsEditable,
  submitLocationChange,
  showSeparateLocationsWithCommas = true,
}) => {
  const [localLocationArray, setLocalLocationArray] = React.useState(null);

  return (
    <div className="flex justify-between w-full">
      {isEditable ? (
        <div className="flex flex-col">
          <div className="flex gap-1.5 pb-1 pt-2">
            <form className="flex content-center w-full gap-1 align-middle">
              <input
                type="text"
                className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
                value={localLocationArray ? localLocationArray.join(", ") : ""}
                onChange={(e) => {
                  setLocalLocationArray(e.target.value.split(",").map((item) => item.trim()));
                }}
              />
              <Button
                variant="muted"
                onClick={() => {
                  setLocalLocationArray(locationArray);
                  setIsEditable(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={() => {
                  submitLocationChange(localLocationArray);
                  setIsEditable(false);
                }} // Send local location to the parent component
              >
                Update
              </Button>
            </form>
          </div>
          {showSeparateLocationsWithCommas && (
            <p className="text-xs text-gray-500">
              Separate locations with commas.
            </p>
          )}
        </div>
      ) : (
        <ul className="flex flex-wrap w-full">
          {!!(locationArray ?? []).length
            ? locationArray.map((item, index) => (
                <Pill
                  key={index}
                  textSize="text-xs"
                  showArrow={index !== locationArray.length - 1}
                  onClick={() => {}}
                >
                  {item}
                </Pill>
              ))
            : "-"}
        </ul>
      )}
      {!isEditable && (
        <div
          className="flex flex-col justify-center"
          onClick={() => {
            setIsEditable(true);
          }}
          role="button"
        >
          <PencilSquareIcon className="w-4 h-4 stroke-slate-300 hover:stroke-pink-500" />
        </div>
      )}
    </div>
  );
};

export default SimpleEditableLocation;
