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
import SolderingMode from "../SolderingMode";
import _ from "lodash";
import { find } from "lodash/find";
import useDeleteUserInventory from "../../services/useDeleteUserInventory";
import useGetUserInventory from "../../services/useGetUserInventory";
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
  const { component, [field]: fieldValue } = row;
  if (component.id !== fieldIdToEdit) {
    setFieldIdToEdit(component.id);
    setUpdatedFieldToSubmit(fieldValue);
  } else {
    setFieldIdToEdit(undefined);
  }
};

const Inventory = () => {
  const [quantityIdToEdit, setQuantityIdToEdit] = useState();
  const [updatedQuantityToSubmit, setUpdatedQuantityToSubmit] = useState();

  const [locationIdToEdit, setLocationIdToEdit] = useState();
  const [updatedLocationToSubmit, setUpdatedLocationToSubmit] = useState();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState();

  const [searchTerm, setSearchTerm] = useState("");
  const [dataSearched, setDataSearched] = useState(undefined);

  const [openSolderingMode, setOpenSolderingMode] = useState(false);

  const { inventoryData, inventoryDataIsLoading, inventoryDataIsError } =
    useGetUserInventory();

  const updateUserInventoryMutate = useUpdateUserInventory();

  const deleteMutation = useDeleteUserInventory();

  const options = {
    includeScore: true,
    shouldSort: true,
    keys: [
      "location",
      "component.description",
      "component.manufacturer.name",
      "component.notes",
      "component.supplier.name",
      "component.supplier_item_no",
      "component.type.name",
    ],
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

  const handleSubmitQuantity = useCallback(async (componentPk) => {
    try {
      await updateUserInventoryMutate({
        componentPk,
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

  const handleSubmitLocation = useCallback(async (componentPk) => {
    try {
      await updateUserInventoryMutate({
        componentPk,
        location: updatedLocationToSubmit,
      });
      setLocationIdToEdit(undefined);
      setUpdatedLocationToSubmit(undefined);
    } catch (error) {
      console.error("Failed to update location", error);
    }
  });

  const handleDelete = useCallback(async (componentPk) => {
    try {
      await deleteMutation.mutate({ componentPk });
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  });

  const handlePillClick = useCallback(async (componentPk, index) => {
    try {
      const location = find(
        inventoryData,
        (el) => el?.component?.id === componentPk
      )?.location;
      location.splice(index, 1);
      await updateUserInventoryMutate({
        componentPk,
        location: location.join(", "),
      });
    } catch (error) {
      console.error("Failed to update location", error);
    }
  });

  if (inventoryDataIsError) {
    return <div>Error fetching data</div>;
  }

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
                row.component.supplier_item_no.replace(/,/g, ""),
                row.component.farads,
                row.component.price,
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
      name: "Name",
      selector: (row) => row.component.description,
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: <div>Type</div>,
      selector: (row) => row.component.type?.name,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>Manufacturer</div>,
      selector: (row) => row.component.manufacturer?.name,
      sortable: true,
      wrap: true,
      hide: 1700,
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
            href={row.component.link}
            className="text-blue-500 hover:text-blue-700"
          >
            {row.component.supplier_item_no}
          </a>
        );
      },
      sortable: true,
      wrap: true,
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
      name: <div>Price</div>,
      selector: (row) =>
        row.component.price && row.component.price_currency
          ? `${row.component.price} ${row.component.price_currency}`
          : row.component.price,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>Tolerance</div>,
      selector: (row) => row.component.tolerance,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>V. Rating</div>,
      selector: (row) => row.component.voltage_rating,
      sortable: true,
      wrap: true,
      hide: 1700,
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
      width: quantityIdToEdit ? "200px" : "100px",
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

  return !!inventoryData?.length ? (
    <>
      <div className="z-10 flex flex-col items-center justify-between gap-2 mb-8 md:w-full md:flex-row">
        {inventoryData && inventoryData.length > 0 && (
          <>
            <div className="pr-2 grow md:w-full">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <SearchInput
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
            <div className="flex gap-2 flex-nowrap">
              <Button
                version="primary"
                Icon={LightBulbIcon}
                iconLocation="left"
                onClick={() => setOpenSolderingMode(true)}
              >
                Soldering Mode
              </Button>
              <Link to="version-history/">
                <Button version="primary">Version History</Button>
              </Link>
              <Button version="primary" onClick={handleDownloadCSV}>
                Download CSV
              </Button>
            </div>
          </>
        )}
      </div>
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
        data={
          _.isArray(dataSearched) && !_.isEmpty(dataSearched)
            ? dataSearched.map((x) => x.item)
            : inventoryData
        }
        progressPending={inventoryDataIsLoading}
        customStyles={customStyles}
      />
      <SolderingMode
        open={openSolderingMode}
        setOpen={setOpenSolderingMode}
        inventoryData={inventoryData}
        inventoryDataIsLoading={inventoryDataIsLoading}
        handleClick={handleClick}
        locationsSort={locationsSort}
        quantityIdToEdit={quantityIdToEdit}
        setQuantityIdToEdit={setQuantityIdToEdit}
        updatedQuantityToSubmit={updatedQuantityToSubmit}
        setUpdatedQuantityToSubmit={setUpdatedQuantityToSubmit}
        locationIdToEdit={locationIdToEdit}
        setLocationIdToEdit={setLocationIdToEdit}
        updatedLocationToSubmit={updatedLocationToSubmit}
        setUpdatedLocationToSubmit={setUpdatedLocationToSubmit}
        deleteModalOpen={deleteModalOpen}
        setDeleteModalOpen={setDeleteModalOpen}
        dataToDelete={dataToDelete}
        setDataToDelete={setDataToDelete}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dataSearched={dataSearched}
        handleQuantityChange={handleQuantityChange}
        handleSubmitQuantity={handleSubmitQuantity}
        handleLocationChange={handleLocationChange}
        handleSubmitLocation={handleSubmitLocation}
        handleDelete={handleDelete}
        handlePillClick={handlePillClick}
      />
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
  );
};

export default Inventory;
