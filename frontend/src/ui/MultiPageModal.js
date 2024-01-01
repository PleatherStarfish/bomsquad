import React, { useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import cx from 'classnames';

export const Types = {
  danger: (
    <ExclamationTriangleIcon className="w-6 h-6 text-red-600" aria-hidden="true" />
  ),
  warning: (
    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" aria-hidden="true" />
  ),
  info: (
    <InformationCircleIcon className="w-6 h-6 text-blue-600" aria-hidden="true" />
  ),
};

const MultiPageModal = ({
  open,
  setOpen,
  title,
  pages,
  type = "info",
  bgOpacity = "bg-opacity-75",
  backdropBlur = undefined,
  initialPage = 1
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const cancelButtonRef = useRef(null);

  const nextPage = () => {
    if (currentPage < pages.length) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const closeAndResetModal = () => {
    setCurrentPage(initialPage);
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={closeAndResetModal}>
        {/* ...Transition elements... */}
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child as={React.Fragment} /* ...Transition properties... */>
              <Dialog.Panel className="relative bg-white rounded-lg shadow-xl">
                {/* Modal content */}
                <div className="sm:flex sm:items-start">
                  <div className={cx("flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10", {"bg-red-100": type === "danger", "bg-yellow-100": type === "warning", "bg-blue-100": type === "info"})}>
                    {Types[type]}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">{title}</Dialog.Title>
                    <div className="mt-2">
                      {pages[currentPage - 1]}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
                  <button onClick={nextPage} disabled={currentPage === pages.length}>Next</button>
                  <button ref={cancelButtonRef} onClick={closeAndResetModal}>Cancel</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MultiPageModal;
