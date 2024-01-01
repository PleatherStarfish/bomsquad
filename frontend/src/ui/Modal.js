import { Dialog, Transition } from "@headlessui/react";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";

import React from "react";
import cx from "classnames";

export const Types = {
  danger: (
    <ExclamationTriangleIcon
      className="w-6 h-6 text-red-600"
      aria-hidden="true"
    />
  ),
  warning: (
    <ExclamationTriangleIcon
      className="w-6 h-6 text-yellow-500"
      aria-hidden="true"
    />
  ),
  info: (
    <InformationCircleIcon
      className="w-6 h-6 text-blue-600"
      aria-hidden="true"
    />
  ),
};

const Modal = ({
  open,
  setOpen = () => {},
  title,
  submitButtonText,
  onSubmit = () => {},
  type = "danger",
  buttons = undefined,
  bgOpacity = "bg-opacity-75",
  backdropBlur = undefined,
  disabled = false,
  children,
}) => {
  const cancelButtonRef = useRef(null);

  const defaultButtons = (
    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      {type === "danger" ? (
        <button
          type="button"
          className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white bg-red-500 rounded-md shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto"
          onClick={() => {
            onSubmit();
            setOpen(false);
          }}
          disabled={disabled}
        >
          {submitButtonText}
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white rounded-md shadow-sm bg-slate-500 hover:bg-slate-600 sm:ml-3 sm:w-auto"
          onClick={() => {
            onSubmit();
            setOpen(false);
          }}
          disabled={disabled}
        >
          {submitButtonText}
        </button>
      )}
      <button
        type="button"
        className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
        onClick={() => setOpen(false)}
        ref={cancelButtonRef}
      >
        Cancel
      </button>
    </div>
  );

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={cx("fixed inset-0 z-50 transition-opacity bg-gray-500", bgOpacity, backdropBlur)} />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
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
                      "flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10",
                      {
                        "bg-red-100": type === "danger",
                        "bg-yellow-100": type === "warning",
                        "bg-blue-100": type === "info",
                      }
                    )}
                  >
                    {Types[type]}
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{children}</p>
                    </div>
                  </div>
                </div>
                {buttons || defaultButtons}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
