import React from 'react';
import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const AddModuleButtons = ({ module, queryName }) => {

  const csrftoken = Cookies.get('csrftoken');

  const hideBuilt = queryName === 'builtModules';
  const hideWtb = queryName === 'wtbModules';

  const addToBuilt = useMutation(
    async () => {
      const response = await axios.post(`/add-to-built/${module}/`, {}, {
        headers: {
          'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
      return response.data;
    }
  );

  const addToWtb = useMutation(
    async () => {
      const response = await axios.post(`/add-to-wtb/${module}/`, {}, {
        headers: {
          'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
      return response.data;
    }
  );

  return (
    <div className="flex flex-col gap-2 mt-4">
      {hideBuilt || (
        <button
          type="button"
          onClick={addToBuilt.mutate}
          disabled={addToBuilt.isLoading}
          className={`inline-flex items-center gap-x-1.5 rounded-md py-1 px-1.5 text-xs font-semibold text-white shadow-sm transition-all
            ${module.is_built ? "bg-pink-600 hover:bg-pink-400" : "bg-gray-500 hover:bg-gray-400"}
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
          `}
        >
          {module.is_built ? (
            <>
              <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Built
            </>
          ) : (
            <>
              Add to built
            </>
          )}
        </button>
      )}
      {hideWtb || 
        <button
          type="button"
          onClick={addToWtb.mutate}
          disabled={addToWtb.isLoading}
          className={`inline-flex items-center gap-x-1.5 rounded-md py-1 px-1.5 text-xs font-semibold text-white shadow-sm transition-all
            ${module.is_wtb ? "bg-pink-600 hover:bg-pink-400" : "bg-gray-500 hover:bg-gray-400"}
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600
          `}
        >
          {module.is_wtb ? (
            <>
              <svg className="-ml-0.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
              </svg>
              Want to build
            </>
          ) : (
            <>
              Add to want-to-build
            </>
          )}
        </button>
      }
    </div>
  );
}

export default AddModuleButtons;
