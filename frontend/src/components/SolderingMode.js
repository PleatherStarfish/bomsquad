import { Dialog, Switch, Transition } from "@headlessui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";
import {
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import Alert from "../ui/Alert";
import DataTable from "react-data-table-component";
import EditableLocation from "./inventory/EditableLocation";
import EditableQuantity from "./inventory/EditableQuantity";
import { Fragment } from "react";
import { Helmet } from "react-helmet";
import Modal from "../ui/Modal";
import _ from "lodash";
import cx from "classnames";

const customStyles = {
  headCells: {
    style: {
      fontSize: "1.3rem",
      fontWeight: "bold",
      padding: "0.4rem",
    },
  },
  rows: {
    style: {
      fontSize: "1.3rem",
      padding: "0.4rem",
    },
  },
};

const SolderingMode = ({
  open,
  setOpen,
  inventoryData,
  inventoryDataIsLoading,
  handleClick,
  locationsSort,
  quantityIdToEdit,
  setQuantityIdToEdit,
  updatedQuantityToSubmit,
  setUpdatedQuantityToSubmit,
  locationIdToEdit,
  setLocationIdToEdit,
  updatedLocationToSubmit,
  setUpdatedLocationToSubmit,
  deleteModalOpen,
  setDeleteModalOpen,
  dataToDelete,
  setDataToDelete,
  searchTerm,
  setSearchTerm,
  dataSearched,
  handleQuantityChange,
  handleSubmitQuantity,
  handleLocationChange,
  handleSubmitLocation,
  handleDelete,
  handlePillClick,
}) => {
  const [darkMode, setDarkMode] = useState(false);

  const darkModeStyles = `
    .rdt_TableHeadRow { background-color: #212529; color: white; border-color: white; }
    .rdt_TableRow { background-color: #212529; color: white; }
    .rdt_Pagination { background-color: #212529; color: white; }
  `;

  const conditionalRowStyles = [
    {
      when: row => darkMode,
      style: {
        backgroundColor: '#212529',
        color: 'white',
        borderColor: "white",
      },
    },
  ];

  const columns = [
    {
      name: "Name",
      selector: (row) => row.component.description,
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: <div>Farads</div>,
      selector: (row) => row.farads,
      sortable: true,
      wrap: true,
      omit: (row) => row.component.type !== "Capacitor",
    },
    {
      name: <div>Ohms</div>,
      selector: (row) => row.ohms,
      sortable: true,
      wrap: true,
      omit: (row) => row.component.type !== "Resistor",
    },
    {
      name: <div>Qty.</div>,
      cell: (row) => (
        <EditableQuantity
          row={row}
          quantityIdToEdit={quantityIdToEdit}
          updatedQuantityToSubmit={updatedQuantityToSubmit}
          handleQuantityChange={handleQuantityChange}
          handleSubmitQuantity={handleSubmitQuantity}
          setQuantityIdToEdit={setQuantityIdToEdit}
          setUpdatedQuantityToSubmit={setUpdatedQuantityToSubmit}
          handleClick={handleClick}
        />
      ),
      sortable: true,
      width: quantityIdToEdit ? "260px" : "100px",
    },
    {
      name: <div>Location</div>,
      cell: (row) => (
        <EditableLocation
          row={row}
          locationIdToEdit={locationIdToEdit}
          updatedLocationToSubmit={updatedLocationToSubmit}
          handleLocationChange={handleLocationChange}
          setLocationIdToEdit={setLocationIdToEdit}
          handleSubmitLocation={handleSubmitLocation}
          handlePillClick={handlePillClick}
          handleClick={handleClick}
          setUpdatedLocationToSubmit={setUpdatedLocationToSubmit}
        />
      ),
      sortable: true,
      wrap: true,
      width: !!locationIdToEdit ? "350px" : undefined,
      minWidth: "200px",
      sortFunction: locationsSort,
    },
    {
      name: "",
      sortable: false,
      cell: (row) => {
        return (
          <TrashIcon
            role="button"
            className="w-5 h-5 stroke-slate-500 hover:stroke-pink-500"
            onClick={() => {
              setDataToDelete(row.component);
              setDeleteModalOpen(true);
            }}
          />
        );
      },
      width: "50px",
    },
  ];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className={cx("relative z-30", {"dark": darkMode})} onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed left-0 flex w-screen pointer-events-none">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-1000 sm:duration-700"
                enterFrom="translate-y-full"
                enterTo="translate-y-0"
                leave="transform transition ease-in-out duration-1000 sm:duration-700"
                leaveFrom="translate-y-0"
                leaveTo="translate-y-full"
              >
                <Dialog.Panel className="w-screen h-screen pointer-events-auto">
                  <div className="flex flex-col h-full py-6 overflow-y-scroll bg-white shadow-xl dark:bg-[#212529]">
                    <div className="px-4 sm:px-6">
                      <div className="flex flex-row items-center justify-end gap-4">
                        <div className="flex">
                          <Switch
                            checked={darkMode}
                            onChange={setDarkMode}
                            className="relative inline-flex flex-shrink-0 w-20 transition-colors duration-200 ease-in-out bg-white border-2 ring-gray-400 rounded-full cursor-pointer dark:ring-white dark:bg-[#212529] h-11 outline-none ring-0"
                          >
                            <span className="sr-only">Use setting</span>
                            <span
                              className={cx(
                                darkMode ? "translate-x-9" : "translate-x-0",
                                "pointer-events-none relative inline-block h-10 w-10 transform rounded-full border-white dark:border-[#212529] bg-gray-400 dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out"
                              )}
                            >
                              <span
                                className={cx(
                                  darkMode
                                    ? "opacity-0 duration-100 ease-out"
                                    : "opacity-100 duration-200 ease-in",
                                  "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                                )}
                                aria-hidden="true"
                              >
                                <SunIcon className="w-14 h-14 fill-yellow-300" />
                              </span>
                              <span
                                className={cx(
                                  darkMode
                                    ? "opacity-100 duration-200 ease-in"
                                    : "opacity-0 duration-100 ease-out",
                                  "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                                )}
                                aria-hidden="true"
                              >
                                <MoonIcon className="w-14 h-14 fill-sky-500" />
                              </span>
                            </span>
                          </Switch>
                        </div>
                        <Dialog.Title className="sr-only">
                          Soldering Mode
                        </Dialog.Title>
                        <div className="flex items-center justify-end h-20 ml-3">
                          <button
                            type="button"
                            className="text-gray-400 bg-white rounded-md dark:bg-[#212529] hover:text-gray-500 dark:hover:text-gray-50 focus:outline-none"
                            onClick={() => {
                              setDarkMode(false)
                              setOpen(false)
                            }}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon
                              className="w-20 h-20"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-4 mt-6 sm:px-6">
                      <div className="pr-2 grow md:w-full">
                        <label htmlFor="search" className="sr-only">
                          Search
                        </label>
                        <input
                          type="text"
                          name="search"
                          id="search"
                          className="mb-8 block w-full rounded-md border-0 py-4 px-6 h-20 bg-white dark:bg-[#3a4141] text-gray-900 dark:ring-0 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#548a6a] dark:focus:ring-white focus:border-[#548a6a] dark:border-0 dark:focus:border-white text-3xl"
                          placeholder="search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {!!inventoryData?.length ? (
                          <>
                            <div className="bg-white dark:bg-[#212529]">
                            <Helmet>
                              <style>{darkMode ? darkModeStyles : ''}</style>
                            </Helmet>
                              <DataTable
                                fixedHeader
                                pagination
                                responsive
                                subHeaderAlign="right"
                                subHeaderWrap
                                exportHeaders
                                progressComponent={
                                  <div className="text-center text-gray-500 animate-pulse">
                                    Loading...
                                  </div>
                                }
                                columns={columns}
                                conditionalRowStyles={conditionalRowStyles}
                                data={
                                  _.isArray(dataSearched) &&
                                  !_.isEmpty(dataSearched)
                                    ? dataSearched.map((x) => x.item)
                                    : inventoryData
                                }
                                progressPending={inventoryDataIsLoading}
                                customStyles={customStyles}
                              />
                            </div>
                            <Modal
                              open={deleteModalOpen}
                              setOpen={setDeleteModalOpen}
                              title={"Delete component?"}
                              submitButtonText={"Delete"}
                              onSubmit={() => {
                                setDataToDelete(undefined);
                                handleDelete(dataToDelete.id);
                              }}
                            >{`Are you sure you want to delete ${dataToDelete?.description}?`}</Modal>
                          </>
                        ) : (
                          <Alert variant="transparent" centered>
                            <span>
                              There are no components in your inventory.{" "}
                              <a className="text-blue-500" href="/components">
                                Add components.
                              </a>
                            </span>
                          </Alert>
                        )}
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
