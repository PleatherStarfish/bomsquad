import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import _ from "lodash";
import cx from "classnames";

const Pagination = ({ currentPage, totalPages, navigate }) => {
  const pageNumbers = _.range(1, totalPages + 1);

  return (
    <nav
      className="inline-flex -space-x-px rounded-md shadow-sm isolate"
      aria-label="Pagination"
    >
      <a
        href="#"
        onClick={() => navigate(Math.max(1, currentPage - 1))}
        className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
      </a>

      {pageNumbers.map((pageNumber) => {
        if (
          pageNumber === 1 ||
          pageNumber === 2 ||
          pageNumber === totalPages ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
        ) {
          return (
            <a
              key={pageNumber}
              href="#"
              aria-current={currentPage === pageNumber ? "page" : undefined}
              onClick={() => navigate(pageNumber)}
              className={cx(
                "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0",
                {
                  "z-10 bg-brandgreen-500 text-white":
                    currentPage === pageNumber,
                  "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-100":
                    currentPage !== pageNumber,
                }
              )}
            >
              {pageNumber}
            </a>
          );
        } else if (pageNumber === 3 || pageNumber === totalPages - 1) {
          return (
            <span
              key={pageNumber}
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900"
            >
              ...
            </span>
          );
        }
        return null; // Don't render anything for the other pages.
      })}

      <a
        href="#"
        onClick={() => navigate(Math.min(totalPages, currentPage + 1))}
        className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
      </a>
    </nav>
  );
};

export default Pagination;
