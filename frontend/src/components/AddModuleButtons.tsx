import { BuildingOffice2Icon, WrenchIcon } from "@heroicons/react/24/outline";

import React from "react";
import cx from "classnames";
import useAddToBuiltMutation from "../services/useAddToBuiltMutation";
import useAddToWtbMutation from "../services/useAddToWtbMutation";
import useModuleStatus from "../services/useModuleStatus";

interface AddModuleButtonsProps {
  moduleId: string;
  queryName: "built" | "want-to-build";
}

const AddModuleButtons: React.FC<AddModuleButtonsProps> = ({ moduleId, queryName }) => {
  const {
    data: moduleStatus,
    isLoading: moduleStatusIsLoading,
    refetch: refetchModuleStatus,
  } = useModuleStatus(moduleId);

  console.log(moduleStatus)

  const hideBuilt = queryName === "built";
  const hideWtb = queryName === "want-to-build";

  const addToBuilt = useAddToBuiltMutation(moduleId, {
    onSuccess: () => {
      refetchModuleStatus();
    },
  });

  // @ts-ignore
  const addToWtb = useAddToWtbMutation(moduleId, {
    onSuccess: () => {
      refetchModuleStatus();
    },
  });

  return (
    <div className="flex flex-col gap-2 mt-4 md:mt-0">
      {!hideBuilt && (
        <button
          className={cx(
            "inline-flex items-center gap-x-2 rounded-md py-2 px-2 text-sm md:text-base font-semibold text-white shadow-sm transition-all",
            {
              "bg-gray-500 hover:bg-gray-400": !moduleStatus?.is_built,
              "bg-pink-600 hover:bg-pink-400": moduleStatus?.is_built,
            }
          )}
          data-tippy-content="Add to your built projects list"
          disabled={moduleStatusIsLoading}
          onClick={() => addToBuilt.mutate()}
          role="button"
        >
          <BuildingOffice2Icon aria-hidden="true" className="w-4 h-4" />
          <span className="sr-only">
            {moduleStatus?.is_built ? "Built" : "Add to built"}
          </span>
        </button>
      )}
      {!hideWtb && (
        <button
          className={cx(
            "inline-flex items-center gap-x-2 rounded-md py-2 px-2 text-sm md:text-base font-semibold text-white shadow-sm transition-all",
            {
              "bg-gray-500 hover:bg-gray-400": !moduleStatus?.is_wtb,
              "bg-pink-600 hover:bg-pink-400": moduleStatus?.is_wtb,
            }
          )}
          data-tippy-content="Add to your want-to-build projects list"
          disabled={moduleStatusIsLoading}
          onClick={() => addToWtb.mutate()}
          role="button"
        >
          <WrenchIcon aria-hidden="true" className="w-4 h-4" />
          <span className="sr-only">
            {moduleStatus?.is_wtb ? "Want to build" : "Add to want-to-build"}
          </span>
        </button>
      )}
    </div>
  );
};

export default AddModuleButtons;
