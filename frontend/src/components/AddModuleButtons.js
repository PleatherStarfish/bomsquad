import { BuildingOffice2Icon, WrenchIcon } from "@heroicons/react/24/outline";

import React from 'react';
import cx from "classnames";
import useAddToBuiltMutation from '../services/useAddToBuiltMutation';
import useAddToWtbMutation from '../services/useAddToWtbMutation';
import useModuleStatus from '../services/useModuleStatus';

const AddModuleButtons = ({ moduleId, queryName }) => {
  const { data: moduleStatus, isLoading: moduleStatusIsLoading, refetch: refetchModuleStatus } = useModuleStatus(moduleId);

  const hideBuilt = queryName === 'built';
  const hideWtb = queryName === 'want-to-build';

  const addToBuilt = useAddToBuiltMutation(moduleId, {
    onSuccess: () => {
      refetchModuleStatus();
    },
  });

  const addToWtb = useAddToWtbMutation(moduleId, {
    onSuccess: () => {
      refetchModuleStatus();
    },
  });

  if (moduleStatusIsLoading) return <p className="animate-pulse">Loading...</p>;

  return (
    <div className="flex flex-col gap-2 mt-4">
      {!hideBuilt && (
        <button
          type="button"
          onClick={addToBuilt.mutate}
          disabled={addToBuilt.isLoading}
          data-tippy-content="Add to your built projects list"
          className={cx(
            "inline-flex items-center gap-x-2 rounded-md py-2 px-2 text-sm md:text-base font-semibold text-white shadow-sm transition-all",
            {
              "bg-pink-600 hover:bg-pink-400": moduleStatus?.is_built,
              "bg-gray-500 hover:bg-gray-400": !moduleStatus?.is_built,
            }
          )}
        >
          <BuildingOffice2Icon className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{moduleStatus?.is_built ? 'Built' : 'Add to built'}</span>
        </button>
      )}
      {!hideWtb && (
        <button
          type="button"
          onClick={addToWtb.mutate}
          disabled={addToWtb.isLoading}
          data-tippy-content="Add to your want-to-build projects list"
          className={cx(
            "inline-flex items-center gap-x-2 rounded-md py-2 px-2 text-sm md:text-base font-semibold text-white shadow-sm transition-all",
            {
              "bg-pink-600 hover:bg-pink-400": moduleStatus?.is_wtb,
              "bg-gray-500 hover:bg-gray-400": !moduleStatus?.is_wtb,
            }
          )}
        >
          <WrenchIcon className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">{moduleStatus?.is_wtb ? 'Want to build' : 'Add to want-to-build'}</span>
        </button>
      )}
    </div>
  );
};

export default AddModuleButtons;
