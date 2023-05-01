import { Dialog, Transition } from "@headlessui/react";

import { Fragment } from "react";
import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const SolderingMode = ({ open, setOpen, setSearchTerm }) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed left-0 flex w-screen">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-1000 sm:duration-700"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-1000 sm:duration-700"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen h-screen">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start flex-row-reverse">
                        <Dialog.Title className="sr-only">
                          Soldering Mode
                        </Dialog.Title>
                        <div className="ml-3 flex justify-end h-20 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon
                              className="h-20 w-20"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <div className="grow md:w-full pr-2">
                        <label htmlFor="search" className="sr-only">
                          Search
                        </label>
                        <input
                          type="text"
                          name="search"
                          id="search"
                          className="block w-full rounded-md border-0 py-4 px-6 h-20 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#548a6a] focus:border-[#548a6a] text-3xl"
                          placeholder="search"
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SolderingMode;
