import React, {useEffect, useState} from "react";

import Button from "../../ui/Button";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Pill from "../../ui/Pill";

const SimpleEditableLocation = ({
  locationArray,
  submitLocationChange,
  showSeparateLocationsWithCommas = true,
}) => {
  const [localLocationString, setLocalLocationString] = useState([]);
  const [isEditable, setIsEditable] = useState(true);

  useEffect(() => {
    if (locationArray.length > 0) {
      setLocalLocationString(locationArray.join(", "))
      setIsEditable(false);
    }
  }, [locationArray]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newLocationArray = localLocationString
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item); // Filter out empty strings
    if (newLocationArray.length > 0) {
      submitLocationChange(newLocationArray);
    } else {
      submitLocationChange([]);
    }
    setIsEditable(false);
  };

  return (
    <div className="flex justify-between w-full">
      {isEditable ? (
        <div className="flex flex-col">
          <div className="flex gap-1.5 pb-1 pt-2">
            <form className="flex content-center w-full gap-1 align-middle">
              <input
                type="text"
                className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
                value={localLocationString}
                onChange={(e) => setLocalLocationString(e.target.value)}
              />
              <Button
                variant="muted"
                onClick={() => {
                  setLocalLocationString([]);
                  submitLocationChange([])
                  setIsEditable(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                onClick={handleSubmit}
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
