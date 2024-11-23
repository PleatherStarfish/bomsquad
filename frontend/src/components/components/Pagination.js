import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

import React from "react";
import _ from "lodash";
import cx from "classnames";

const Pagination = ({ currentPage, totalPages, navigate }) => {
  const pageNumbers = _.range(1, totalPages + 1);

  return (
    <nav
      aria-label="Pagination"
      className="inline-flex -space-x-px rounded-md shadow-sm isolate"
    >
      {/* Previous Button */}
      <a
        className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(Math.max(1, currentPage - 1));
        }}
      >
        <span className="sr-only">Previous</span>
        <ChevronLeftIcon aria-hidden="true" className="w-5 h-5" />
      </a>

      {/* Page Numbers */}
      {pageNumbers.map((pageNumber, index) => {
        if (
          pageNumber === 1 ||
          pageNumber === 2 ||
          pageNumber === totalPages ||
          (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
        ) {
          return (
            <a
              aria-current={currentPage === pageNumber ? "page" : undefined}
              className={cx(
                "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:outline-offset-0",
                {
                  "bg-brandgreen-500 text-white": currentPage === pageNumber,
                  "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-100":
                    currentPage !== pageNumber,
                }
              )}
              href="#"
              key={index}
              onClick={(e) => {
                e.preventDefault();
                navigate(pageNumber);
              }}
            >
              {pageNumber}
            </a>
          );
        } else if (pageNumber === 3 || pageNumber === totalPages - 1) {
          return (
            <span
              className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900"
              key={index}
            >
              ...
            </span>
          );
        }
        return null; // Skip rendering for hidden page numbers
      })}

      {/* Next Button */}
      <a
        className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
        href="#"
        onClick={(e) => {
          e.preventDefault();
          navigate(Math.min(totalPages, currentPage + 1));
        }}
      >
        <span className="sr-only">Next</span>
        <ChevronRightIcon aria-hidden="true" className="w-5 h-5" />
      </a>
    </nav>
  );
};

export default Pagination;
