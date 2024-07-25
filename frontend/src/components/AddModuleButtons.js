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
          className={cx(
            "inline-flex items-center gap-x-1.5 rounded-md p-1.5 text-xs font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
            {
              "bg-pink-600 hover:bg-pink-400": moduleStatus?.is_built,
              "bg-gray-500 hover:bg-gray-400": !moduleStatus?.is_built,
            }
          )}
        >
          {moduleStatus?.is_built ? (
            <>
              <svg
                className="-ml-0.5 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              Built
            </>
          ) : (
            <>Add to built</>
          )}
        </button>
      )}
      {!hideWtb && (
        <button
          type="button"
          onClick={addToWtb.mutate}
          disabled={addToWtb.isLoading}
          className={cx(
            "inline-flex items-center gap-x-1.5 rounded-md p-1.5 text-xs font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
            {
              "bg-pink-600 hover:bg-pink-400": moduleStatus?.is_wtb,
              "bg-gray-500 hover:bg-gray-400": !moduleStatus?.is_wtb,
            }
          )}
        >
          {moduleStatus?.is_wtb ? (
            <>
              <svg
                className="-ml-0.5 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
              Want to build
            </>
          ) : (
            <>Add to want-to-build</>
          )}
        </button>
      )}
    </div>
  );
};

export default AddModuleButtons;