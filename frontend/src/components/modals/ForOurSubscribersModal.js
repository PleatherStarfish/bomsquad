import Modal from "../../ui/Modal";
import React from "react";
import goToSupport from "../../utils/goToSupport";

const ForOurSubscribersModal = ({
  open,
  onClickSupport = () => goToSupport(),
  onClickCancel,
  title = "This is a feature for our subscribers",
  message = "BOM Squad depends on our the support of our subscribers to keep our servers online. Please help support the project and get access to version history.",
}) => {
  return (
    <Modal
      open={open}
      title={title}
      type="info"
      backdropBlur={"backdrop-blur-sm"}
      buttons={
        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white rounded-md shadow-sm bg-slate-500 hover:bg-slate-600 sm:ml-3 sm:w-auto"
            onClick={onClickSupport}
          >
            Support
          </button>
          <button
            type="button"
            className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            onClick={onClickCancel}
          >
            Cancel
          </button>
        </div>
      }
    >
      {message}
    </Modal>
  );
};

export default ForOurSubscribersModal