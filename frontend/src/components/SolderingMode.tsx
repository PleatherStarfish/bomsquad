import { Dialog, Switch, Transition } from "@headlessui/react";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import { TableColumn } from "react-data-table-component";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";

import Alert from "../ui/Alert";
import DataTable from "react-data-table-component";
import EditableLocation from "./inventory/EditableLocation";
import EditableQuantity from "./inventory/EditableQuantity";
import { Fragment } from "react";
import { Helmet } from "react-helmet";
import { Component } from "../types/component"
import Modal from "../ui/Modal";
import _ from "lodash";
import cx from "classnames";

interface SolderingModeProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  inventoryData: InventoryRow[]; // Define this interface separately
  inventoryDataIsLoading: boolean;
  handleClick: (row: InventoryRow, field: string) => void;
  locationsSort: (a: InventoryRow, b: InventoryRow) => number;
  quantityIdToEdit: string | null;
  setQuantityIdToEdit: React.Dispatch<React.SetStateAction<string | null>>;
  updatedQuantityToSubmit: number | null;
  setUpdatedQuantityToSubmit: React.Dispatch<
    React.SetStateAction<number | null>
  >;
  locationIdToEdit: string | null;
  setLocationIdToEdit: React.Dispatch<React.SetStateAction<string | null>>;
  updatedLocationToSubmit: string | null;
  setUpdatedLocationToSubmit: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  deleteModalOpen: boolean;
  setDeleteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dataToDelete: InventoryRow | null;
  setDataToDelete: React.Dispatch<React.SetStateAction<InventoryRow | null>>;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  dataSearched: InventoryRow[];
  handleQuantityChange: (quantity: number) => void;
  handleSubmitQuantity: (id: string) => void;
  handleLocationChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmitLocation: (id: string) => void;
  handleDelete: (id: string) => void;
  handlePillClick: (id: string, index: number) => void;
}

interface InventoryRow {
  id: string;
  user: number;
  component: Component;
  quantity: number;
  location: string[] | null;
}

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

const SolderingMode: React.FC<SolderingModeProps> = ({
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
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const dataForTable: InventoryRow[] =
    _.isArray(dataSearched) && !_.isEmpty(dataSearched)
      ? dataSearched.filter((x: InventoryRow) => x && x.id)
      : inventoryData;
  
  console.log("dataForTable", dataForTable)

  const darkModeStyles = `
    .rdt_TableHeadRow { background-color: #212529; color: white; border-color: white; }
    .rdt_TableRow { background-color: #212529; color: white; }
    .rdt_Pagination { background-color: #212529; color: white; }
  `;

  const conditionalRowStyles: {
    when: (row: InventoryRow) => boolean;
    style: React.CSSProperties;
  }[] = [
    {
      style: {
        backgroundColor: "#212529",
        borderColor: "white",
        color: "white",
      },
      when: () => darkMode,
    },
  ];

  const columns: TableColumn<InventoryRow>[] = [
    {
      grow: 1,
      name: "Name",
      selector: (row) => row.component.description,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => (
        <EditableQuantity
          handleClick={handleClick}
          handleQuantityChange={handleQuantityChange}
          handleSubmitQuantity={handleSubmitQuantity}
          quantityIdToEdit={quantityIdToEdit}
          row={row}
          setQuantityIdToEdit={setQuantityIdToEdit}
          setUpdatedQuantityToSubmit={setUpdatedQuantityToSubmit}
          updatedQuantityToSubmit={updatedQuantityToSubmit}
        />
      ),
      name: <div>Qty.</div>,
      sortable: true,
      width: quantityIdToEdit ? "260px" : "100px",
    },
    {
      cell: (row) => (
        <EditableLocation
          handleClick={handleClick}
          handleLocationChange={handleLocationChange}
          handlePillClick={handlePillClick}
          handleSubmitLocation={handleSubmitLocation}
          locationIdToEdit={locationIdToEdit}
          row={row}
          setLocationIdToEdit={setLocationIdToEdit}
          setUpdatedLocationToSubmit={setUpdatedLocationToSubmit}
          textSize={"text-lg"}
          updatedLocationToSubmit={updatedLocationToSubmit}
        />
      ),
      minWidth: "200px",
      name: <div>Location</div>,
      sortFunction: locationsSort,
      // eslint-disable-next-line sort-keys
      sortable: true,
      width: !!locationIdToEdit ? "350px" : undefined,
      wrap: true,
    },
    {
      cell: (row) => {
        return (
          <TrashIcon
            className="w-5 h-5 stroke-slate-500 hover:stroke-pink-500"
            onClick={() => {
              setDataToDelete(row);
              setDeleteModalOpen(true);
            }}
            role="button"
          />
        );
      },
      name: "",
      sortable: false,
      width: "50px",
    },
  ];

  return (
    <Transition.Root as={Fragment} show={open}>
      <Dialog
        as="div"
        className={cx("relative z-30", { dark: darkMode })}
        onClose={setOpen}
      >
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
                            className="relative inline-flex flex-shrink-0 w-20 transition-colors duration-200 ease-in-out bg-white border-2 ring-gray-400 rounded-full cursor-pointer dark:ring-white dark:bg-[#212529] h-11 outline-none ring-0"
                            onChange={setDarkMode}
                          >
                            <span className="sr-only">Use setting</span>
                            <span
                              className={cx(
                                darkMode ? "translate-x-9" : "translate-x-0",
                                "pointer-events-none relative inline-block h-10 w-10 transform rounded-full border-white dark:border-[#212529] bg-gray-400 dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out"
                              )}
                            >
                              <span
                                aria-hidden="true"
                                className={cx(
                                  darkMode
                                    ? "opacity-0 duration-100 ease-out"
                                    : "opacity-100 duration-200 ease-in",
                                  "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                                )}
                              >
                                <SunIcon className="w-14 h-14 fill-yellow-300" />
                              </span>
                              <span
                                aria-hidden="true"
                                className={cx(
                                  darkMode
                                    ? "opacity-100 duration-200 ease-in"
                                    : "opacity-0 duration-100 ease-out",
                                  "absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
                                )}
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
                            className="text-gray-400 bg-white rounded-md dark:bg-[#212529] hover:text-gray-500 dark:hover:text-gray-50 focus:outline-none"
                            onClick={() => {
                              setDarkMode(false);
                              setOpen(false);
                            }}
                            type="button"
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon
                              aria-hidden="true"
                              className="w-20 h-20"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-4 mt-6 sm:px-6">
                      <div className="pr-2 grow md:w-full">
                        <label className="sr-only" htmlFor="search">
                          Search
                        </label>
                        <input
                          className="mb-8 block w-full rounded-md border-0 py-4 px-6 h-20 bg-white dark:bg-[#3a4141] text-gray-900 dark:ring-0 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#548a6a] dark:focus:ring-white focus:border-[#548a6a] dark:border-0 dark:focus:border-white text-3xl"
                          id="search"
                          name="search"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                          placeholder="search"
                          type="text"
                          value={searchTerm}
                        />
                        {!!inventoryData?.length ? (
                          <>
                            <div className="bg-white dark:bg-[#212529]">
                              <Helmet>
                                <style>{darkMode ? darkModeStyles : ""}</style>
                              </Helmet>
                              <DataTable
                                columns={columns}
                                // @ts-ignore
                                conditionalRowStyles={conditionalRowStyles}
                                customStyles={customStyles}
                                data={dataForTable}
                                exportHeaders
                                fixedHeader
                                pagination
                                progressComponent={
                                  <div className="text-center text-gray-500 animate-pulse">
                                    Loading...
                                  </div>
                                }
                                progressPending={inventoryDataIsLoading}
                                responsive
                                // @ts-ignore
                                subHeaderAlign="right"
                                subHeaderWrap
                              />
                            </div>
                            <Modal
                              onSubmit={() => {
                                setDataToDelete(null);
                                if (dataToDelete) {
                                  handleDelete(dataToDelete.id);
                                }
                              }}
                              open={deleteModalOpen}
                              setOpen={setDeleteModalOpen}
                              submitButtonText={"Delete"}
                              title={"Delete component?"}
                            >{`Are you sure you want to delete ${dataToDelete?.component.description}?`}</Modal>
                          </>
                        ) : (
                          <Alert align="center" variant="transparent">
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
