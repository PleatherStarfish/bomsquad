import React, { useEffect } from "react";
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Button from "../../ui/Button";

const AddComponentModal = ({open, setOpen, title, text, componentId, quantityRequired}) => {
  const [quantity, setQuantity] = React.useState();

  useEffect(() => {
    setQuantity(quantityRequired);
  }, [quantityRequired]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {text}
                      </p>
                      <div className="w-1/2 md:w-1/4 lg:w-2/5 my-6">
                        <label for="quantityInput" className="block mb-1 font-medium text-gray-700">Quantity to add:</label>
                        <input 
                          id="quantityInput"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full pl-2 border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500 h-8 border border-gray-300"/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 flex sm:flex-row-reverse flex-nowrap gap-2">
                  <Button
                    variant="primary"
                    onClick={() => setOpen(false)}
                  >
                    Add
                  </Button>
                  <Button
                    variant="muted"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}

export default AddComponentModal;