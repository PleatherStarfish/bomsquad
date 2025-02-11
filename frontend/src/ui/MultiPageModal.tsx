import { Dialog, Transition } from '@headlessui/react';
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import cx from 'classnames';

export type ModalType = 'danger' | 'info' | 'warning';

export const Types: Record<ModalType, React.ReactNode> = {
  danger: (
    <ExclamationTriangleIcon
      aria-hidden="true"
      className="w-6 h-6 text-red-600"
    />
  ),
  info: (
    <InformationCircleIcon
      aria-hidden="true"
      className="w-6 h-6 text-blue-600"
    />
  ),
  warning: (
    <ExclamationTriangleIcon
      aria-hidden="true"
      className="w-6 h-6 text-yellow-500"
    />
  ),
};

export interface MultiPageModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  pages: React.ReactNode[];
  type?: ModalType;
  bgOpacity?: string;
  backdropBlur?: string;
  initialPage?: number;
  submitButtonText?: string;
  onSubmit?: () => void;
  disabled?: boolean;
  pagesTitles?: string[];
}

const MultiPageModal: React.FC<MultiPageModalProps> = ({
  open,
  setOpen,
  pages,
  type = 'info',
  bgOpacity = 'bg-opacity-75',
  backdropBlur,
  initialPage = 1,
  submitButtonText = 'Submit',
  onSubmit = () => {},
  disabled = false,
  pagesTitles = [],
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const nextPage = (): void => {
    if (currentPage < pages.length) setCurrentPage(currentPage + 1);
  };

  const prevPage = (): void => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const closeAndResetModal = (): void => {
    setCurrentPage(initialPage);
    setOpen(false);
  };

  const renderButtons = (): React.ReactNode => {
    return (
      <div className="flex flex-col w-full mt-5 space-x-3 sm:flex sm:flex-row-reverse">
        {currentPage === pages.length && (
          <>
            {type === 'danger' ? (
              <button
                className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto"
                disabled={disabled}
                onClick={() => {
                  onSubmit();
                  setOpen(false);
                }}
                type="button"
              >
                {submitButtonText}
              </button>
            ) : (
              <button
                className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white rounded-md shadow-sm bg-slate-500 hover:bg-slate-600 sm:ml-3 sm:w-auto"
                disabled={disabled}
                onClick={() => {
                  onSubmit();
                  setOpen(false);
                }}
                type="button"
              >
                {submitButtonText}
              </button>
            )}
          </>
        )}
        {!(currentPage < pages.length) && (
          <button
            className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={() => setOpen(false)}
            ref={cancelButtonRef}
            type="button"
          >
            Cancel
          </button>
        )}
        {currentPage < pages.length && (
          <>
            <button
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3"
              onClick={nextPage}
              type="button"
            >
              Next
            </button>
            <button
              className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={() => setOpen(false)}
              ref={cancelButtonRef}
              type="button"
            >
              Cancel
            </button>
          </>
        )}
        {currentPage > 1 && (
          <button
            className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={prevPage}
            type="button"
          >
            Previous
          </button>
        )}
      </div>
    );
  };

  return (
    <Transition.Root as={React.Fragment} show={open}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={closeAndResetModal}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={cx(
              'fixed inset-0 z-50 transition-opacity bg-gray-500',
              bgOpacity,
              backdropBlur
            )}
          />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div
                    className={cx(
                      'flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10',
                      {
                        'bg-blue-100': type === 'info',
                        'bg-red-100': type === 'danger',
                        'bg-yellow-100': type === 'warning',
                      }
                    )}
                  >
                    {Types[type]}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      {pagesTitles[currentPage - 1]}
                    </Dialog.Title>
                    <div className="mt-2">{pages[currentPage - 1]}</div>
                  </div>
                </div>
                {renderButtons()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default MultiPageModal;
