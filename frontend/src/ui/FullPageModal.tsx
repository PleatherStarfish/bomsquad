import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef } from "react";
import { ModalProps, Types } from "./Modal";

import React from "react";
import cx from "classnames";

interface FullPageModalProps extends Omit<ModalProps, "type"> {
  subsubtitle?: string;
  subtitle?: React.JSX.Element;
  type?: keyof typeof Types;
  customButtons?: React.ReactNode;
}

const FullPageModal: React.FC<FullPageModalProps> = ({
  open,
  setOpen,
  subtitle,
  subsubtitle = "",
  title,
  submitButtonText,
  onSubmit = () => {},
  customButtons,
  bgOpacity = "bg-opacity-75",
  backdropBlur = undefined,
  disabled = false,
  onlyCancelButton = false,
  children,
}) => {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  const defaultButtons = (
    <div className="w-full mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
      {!onlyCancelButton && (
        <button
          className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white rounded-md shadow-sm sm:ml-3 sm:w-auto"
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
      <button
        className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
        onClick={() => setOpen(false)}
        ref={cancelButtonRef}
        type="button"
      >
        Cancel
      </button>
    </div>
  );

  return (
    <Transition.Root as={Fragment} show={open}>
      <Dialog
        as="div"
        className="relative"
        initialFocus={cancelButtonRef}
        onClose={() => setOpen(false)}
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
          <div
            className={cx(
              "fixed inset-0 z-50 transition-opacity bg-gray-500",
              bgOpacity,
              backdropBlur
            )}
          />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center w-full min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={cx(
                  "relative w-full max-w-7xl overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8",
                  "flex flex-col max-h-[90vh]" // Ensure max height is constrained
                )}
              >
                <div className="flex-1 overflow-y-auto p-8" id="modal-content-container">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl text-left font-semibold leading-6 text-gray-900 py-4 font-display"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="text-xs mb-4">
                    <small>{subsubtitle}</small>
                  </div>
                  <div className="text-sm mb-4">
                    {subtitle}
                  </div>
                  <div className="w-full mt-2">{children}</div>
                </div>
                <div className="p-4 border-t border-gray-300">
                  {customButtons || defaultButtons}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default FullPageModal;
