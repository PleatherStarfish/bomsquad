import { LightBulbIcon, TrashIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import DataTable from "react-data-table-component";
import EditableLocation from "./EditableLocation";
import EditableQuantity from "./EditableQuantity";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";
import Modal from "../../ui/Modal";
import SearchInput from "./SearchInput";
import { SignpostSplit } from "react-bootstrap-icons";
import SolderingMode from "../SolderingMode";
import _ from "lodash";
import { find } from "lodash/find";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useDeleteUserInventory from "../../services/useDeleteUserInventory";
import useGetUserInventory from "../../services/useGetUserInventory";
import { useNavigate } from 'react-router-dom';
import useUpdateUserInventory from "../../services/useUpdateUserInventory";

const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
  rows: {
    style: {
      padding: "0.2rem 0 0.2rem 0",
    },
  },
};

const handleClick = (
  row,
  field,
  fieldIdToEdit,
  setFieldIdToEdit,
  setUpdatedFieldToSubmit
) => {
  const { id, [field]: fieldValue } = row;
  if (id !== fieldIdToEdit) {
    setFieldIdToEdit(id);
    setUpdatedFieldToSubmit(fieldValue);
  } else {
    setFieldIdToEdit(undefined);
  }
};

const Inventory = () => {
  const [error, setError] = useState(null)
  const [quantityIdToEdit, setQuantityIdToEdit] = useState();
  const [updatedQuantityToSubmit, setUpdatedQuantityToSubmit] = useState();

  const [locationIdToEdit, setLocationIdToEdit] = useState();
  const [updatedLocationToSubmit, setUpdatedLocationToSubmit] = useState();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState();

  const [searchTerm, setSearchTerm] = useState("");
  const [dataSearched, setDataSearched] = useState(undefined);

  const [openSolderingMode, setOpenSolderingMode] = useState(false);

  const [showGetPremiumModal, setShowGetPremiumModal] = useState(false);

  const navigate = useNavigate();

  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  const { inventoryData, inventoryDataIsLoading, inventoryDataIsError } =
    useGetUserInventory();

  const {updateUserInventoryMutate, error: mutateError} = useUpdateUserInventory();

  const deleteMutation = useDeleteUserInventory();

  const options = {
    includeScore: true,
    keys: [
      "location",
      "component.description",
      "component.manufacturer.name",
      "component.notes",
      "component.supplier.name",
      "component.supplier_item_no",
      "component.type.name",
    ],
    shouldSort: true,
  };

  const fuse =
    inventoryData && inventoryData.length > 0
      ? new Fuse(inventoryData, options)
      : undefined;

  useEffect(() => {
    if (fuse) {
      setDataSearched(fuse.search(searchTerm));
    }
  }, [searchTerm]);

  const handleQuantityChange = useCallback(async (value) => {
    setUpdatedQuantityToSubmit(value);
  });

  const handleSubmitQuantity = useCallback(async (inventoryPk) => {
    try {
      await updateUserInventoryMutate({
        inventoryPk,
        quantity: updatedQuantityToSubmit,
      });
      setQuantityIdToEdit(undefined);
      setUpdatedQuantityToSubmit(undefined);
    } catch (error) {
      console.error("Failed to update quantity", error);
    }
  });

  const handleLocationChange = useCallback(async (event) => {
    event.preventDefault();
    setUpdatedLocationToSubmit(event.target.value);
  });

  const handleSubmitLocation = useCallback(async (inventoryPk) => {
    try {
      await updateUserInventoryMutate({
        inventoryPk,
        location: updatedLocationToSubmit,
      });
      setLocationIdToEdit(undefined);
      setUpdatedLocationToSubmit(undefined);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred");
    }
  });

  const handleDelete = useCallback(async (inventoryPk) => {
    try {
      await deleteMutation.mutate({ inventoryPk });
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  });

  const handlePillClick = useCallback(async (inventoryPk, index) => {
    try {
      const location = find(
        inventoryData,
        (el) => el?.id === inventoryPk
      )?.location;
      location.splice(index, 1);
      await updateUserInventoryMutate({
        inventoryPk,
        location: location.join(", "),
      });
      setError(null);
    } catch (error) {
      console.error("Failed to update location", error);
      setError(err.response?.data?.error || "An error occurred");
    }
  });

  if (userIsLoading)
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );

  if (inventoryDataIsError || userIsError) {
    return <div>Error fetching data</div>;
  }

  const handleGetPremiumModal = () => {
    setShowGetPremiumModal(true);
  };

  const handleDownloadCSV = () => {
    const csvData =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(
        [
          "Name",
          "Supplier Item No",
          "Farads",
          "Price",
          "Quantity",
          "Location",
        ].join(",") +
          "\n" +
          inventoryData
            .map((row) =>
              [
                row.component.description.replace(/,/g, ""),
                (row.component.supplier_item_no ?? "").replace(/,/g, ""),
                row.component.farads,
                row.component.unit_price,
                row.quantity,
                row.location
                  ? row.location
                      .map((item) => item.trim())
                      .join()
                      .replace(/,/g, " -> ")
                  : "",
              ].join(",")
            )
            .join("\n")
      );

    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", csvData);
    downloadLink.setAttribute("download", "inventory.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const locationsSort = (locationA, locationB) => {
    const a =
      locationA && Array.isArray(locationA.location)
        ? locationA.location.join(",").toLowerCase()
        : "";
    const b =
      locationB && Array.isArray(locationB.location)
        ? locationB.location.join(",").toLowerCase()
        : "";

    if (a > b) {
      return 1;
    }

    if (b > a) {
      return -1;
    }

    return 0;
  };

  const columns = [
    {
      grow: 1,
      name: "Name",
      selector: (row) => row.component.description,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Type</div>,
      selector: (row) => row.component.type?.name,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Manufacturer</div>,
      selector: (row) => row.component.manufacturer?.name,
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Supplier</div>,
      selector: (row) => row.component.supplier?.name,
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Supp. Item #</div>,
      selector: (row) => {
        return (
          <a
            className="text-blue-500 hover:text-blue-700"
            href={row.component.link}
          >
            {row.component?.supplier_item_no ? row.component?.supplier_item_no : "[ none ]"}
          </a>
        );
      },
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Farads</div>,
      omit: (row) => row.component.type !== "Capacitor",
      selector: (row) => row.farads,
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Ohms</div>,
      omit: (row) => row.component.type !== "Resistor",
      selector: (row) => row.ohms,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Price</div>,
      selector: (row) =>
        row.component.unit_price && row.component.price_currency
          ? `${row.component.unit_price} ${row.component.price_currency}`
          : row.component.unit_price,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Tolerance</div>,
      selector: (row) => row.component.tolerance,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>V. Rating</div>,
      selector: (row) => row.component.voltage_rating,
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
      width: quantityIdToEdit ? "200px" : "100px",
    },
    {
      cell: (row) => (
        <div className="flex flex-col w-full">
            <EditableLocation
              handleClick={handleClick}
              handleLocationChange={handleLocationChange}
              handlePillClick={handlePillClick}
              handleSubmitLocation={handleSubmitLocation}
              locationIdToEdit={locationIdToEdit}
              row={row}
              setLocationIdToEdit={setLocationIdToEdit}
              setUpdatedLocationToSubmit={setUpdatedLocationToSubmit}
              updatedLocationToSubmit={updatedLocationToSubmit}
            />
          {error && row.id === locationIdToEdit && (
            <div className="mt-1 text-xs text-red-500">{error}</div>
          )}
        </div>
      ),
      minWidth: "200px",
      name: <div>Location</div>,
      sortFunction: locationsSort,
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
              setDataToDelete({component: row.component, id: row.id});
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
    <>
      {!!inventoryData?.length ? (
        <>
          <div className="z-10 flex flex-col items-center justify-between gap-2 mb-8 md:w-full md:flex-row">
            {inventoryData && inventoryData.length > 0 && (
              <>
                <div className="pr-2 grow md:w-full">
                  <label className="sr-only" htmlFor="search">
                    Search
                  </label>
                  <SearchInput
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                </div>
                <div className="flex gap-2 flex-nowrap">
                  <Button
                    Icon={LightBulbIcon}
                    iconLocation="left"
                    onClick={() => setOpenSolderingMode(true)}
                    version="primary"
                  >
                    Soldering Mode
                  </Button>
                  <Link to="tree/">
                    <Button Icon={SignpostSplit} version="primary">Locations Diagram</Button>
                  </Link>
                  <Link to="version-history/">
                    <Button version="primary">Version History</Button>
                  </Link>
                  <Button
                    onClick={
                      user.is_premium
                        ? handleDownloadCSV
                        : handleGetPremiumModal
                    }
                    version="primary"
                  >
                    Download CSV
                  </Button>
                </div>
              </>
            )}
          </div>
          <DataTable
            columns={columns}
            customStyles={customStyles}
            data={
              _.isArray(dataSearched) && !_.isEmpty(dataSearched)
                ? dataSearched.map((x) => x.item)
                : inventoryData
            }
            exportHeaders
            fixedHeader
            pagination
            paginationPerPage={30}
            paginationRowsPerPageOptions={[30, 50, 100]}
            progressComponent={
              <div className="text-center text-gray-500 animate-pulse">
                Loading...
              </div>
            }
            progressPending={inventoryDataIsLoading}
            responsive
            subHeaderAlign="right"
            subHeaderWrap
          />
          <SolderingMode
            dataSearched={dataSearched}
            dataToDelete={dataToDelete}
            deleteModalOpen={deleteModalOpen}
            handleClick={handleClick}
            handleDelete={handleDelete}
            handleLocationChange={handleLocationChange}
            handlePillClick={handlePillClick}
            handleQuantityChange={handleQuantityChange}
            handleSubmitLocation={handleSubmitLocation}
            handleSubmitQuantity={handleSubmitQuantity}
            inventoryData={inventoryData}
            inventoryDataIsLoading={inventoryDataIsLoading}
            locationIdToEdit={locationIdToEdit}
            locationsSort={locationsSort}
            open={openSolderingMode}
            quantityIdToEdit={quantityIdToEdit}
            searchTerm={searchTerm}
            setDataToDelete={setDataToDelete}
            setDeleteModalOpen={setDeleteModalOpen}
            setLocationIdToEdit={setLocationIdToEdit}
            setOpen={setOpenSolderingMode}
            setQuantityIdToEdit={setQuantityIdToEdit}
            setSearchTerm={setSearchTerm}
            setUpdatedLocationToSubmit={setUpdatedLocationToSubmit}
            setUpdatedQuantityToSubmit={setUpdatedQuantityToSubmit}
            updatedLocationToSubmit={updatedLocationToSubmit}
            updatedQuantityToSubmit={updatedQuantityToSubmit}
          />
          <Modal
            onSubmit={() => {
              setDataToDelete(undefined);
              handleDelete(dataToDelete?.id);
            }}
            open={deleteModalOpen}
            setOpen={setDeleteModalOpen}
            submitButtonText={"Delete"}
            title={"Delete component?"}
          >{`Are you sure you want to delete ${dataToDelete?.component.description}?`}</Modal>
        </>
      ) : (
        <Alert centered variant="transparent">
          <span>
            There are no components in your inventory.{" "}
            <a className="text-blue-500" href="/components">
              Add components.
            </a>
          </span>
        </Alert>
      )}
      {!user.is_premium && (
        <Modal
          buttons={
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white rounded-md shadow-sm bg-slate-500 hover:bg-slate-600 sm:ml-3 sm:w-auto"
                  onClick={() => navigate('/premium')}
                  type="button"
                >
                  Support
                </button>
              <button
                className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => setShowGetPremiumModal(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          }
          open={showGetPremiumModal}
          title={`This is a feature for our Patreon supporters`}
          type="info"
        >
          {`BOM Squad depends on our Patreon supports to keep our servers online. Please help support the project and get access to version history.`}
        </Modal>
      )}
    </>
  );
};

export default Inventory;
