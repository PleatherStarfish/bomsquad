import {
  LightBulbIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useState } from "react";

import Button from "../ui/Button";
import ControlledInput from "./ControlledInput";
import DataTable from "react-data-table-component";
import { Link } from "react-router-dom";
import Modal from "../ui/Modal";
import NumericInput from "react-numeric-input";
import Pill from "../ui/Pill";
import { find } from "lodash/find";
import useDeleteUserInventory from "../services/useDeleteUserInventory";
import useGetUserInventory from "../services/useGetUserInventory";
import useUpdateUserInventory from "../services/useUpdateUserInventory";

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

  const { inventoryData, inventoryDataIsLoading, inventoryDataIsError } =
    useGetUserInventory();

  const mutation = useUpdateUserInventory();

  const deleteMutation = useDeleteUserInventory();

  const handleQuantityChange = useCallback(async (event) => {
    event.preventDefault();
    setUpdatedQuantityToSubmit(event.target.value);
  });

  const handleSubmitQuantity = useCallback(async (componentPk) => {
    try {
      await mutation.mutate({ componentPk, quantity: updatedQuantityToSubmit });
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
      await mutation.mutate({ componentPk, location: updatedLocationToSubmit });
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
      await mutation.mutate({ componentPk, location: location.join(", ") });
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
      cell: (row) => {
        return (
          <div className="flex justify-between content-center w-full">
            {row.component.id === quantityIdToEdit ? (
              <div>
                <form
                  className="w-full flex content-center gap-1"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <NumericInput
                    className="block w-16 rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
                    type="number"
                    value={updatedQuantityToSubmit ?? row.quantity}
                    onChange={(e) => handleQuantityChange(e)}
                  />
                  <div className="flex gap-1 justify-around">
                    <Button
                      className="h-full"
                      variant="muted"
                      size="sm"
                      onClick={() => {
                        setQuantityIdToEdit(undefined);
                        setUpdatedQuantityToSubmit(undefined);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-full"
                      variant="primary"
                      size="sm"
                      onClick={() => handleSubmitQuantity(row.component.id)}
                    >
                      Update
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <span className="font-bold">{row.quantity}</span>
            )}
            {row.component.id !== quantityIdToEdit && (
              <div
                onClick={() =>
                  handleClick(
                    row,
                    "quantity",
                    quantityIdToEdit,
                    setQuantityIdToEdit,
                    setUpdatedQuantityToSubmit
                  )
                }
                role="button"
              >
                <PencilSquareIcon className="stroke-slate-300 w-4 h-4 hover:stroke-pink-500" />
              </div>
            )}
          </div>
        );
      },
      sortable: true,
      width: quantityIdToEdit ? "230px" : "80px",
    },
    {
      name: <div>Location</div>,
      cell: (row) => (
        <div className="flex justify-between w-full">
          {row.component.id === locationIdToEdit ? (
            <div className="flex flex-col">
              <div className="flex gap-1.5 pb-1 pt-6">
                <form
                  className="w-full flex content-center gap-1"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <ControlledInput
                    type="text"
                    className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
                    value={updatedLocationToSubmit ?? row.location}
                    onChange={(e) => handleLocationChange(e)}
                  />
                  <Button
                    variant="muted"
                    onClick={() => setLocationIdToEdit(undefined)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    onClick={() => handleSubmitLocation(row.component.id)}
                  >
                    Update
                  </Button>
                </form>
              </div>
              <p className="text-gray-500 text-xs">
                Separate locations with commas.
              </p>
            </div>
          ) : (
            <ul className="flex flex-wrap w-full">
              {row.location
                ? row.location.map((item, index) => (
                    <Pill
                      key={index}
                      showArrow={index !== row.location.length - 1}
                      onClick={() => handlePillClick(row.component.id, index)}
                    >
                      {item}
                    </Pill>
                  ))
                : "-"}
            </ul>
          )}
          {row.component.id !== locationIdToEdit && (
            <div
              className="flex flex-col justify-center"
              onClick={() =>
                handleClick(
                  row,
                  "location",
                  locationIdToEdit,
                  setLocationIdToEdit,
                  setUpdatedLocationToSubmit
                )
              }
              role="button"
            >
              <PencilSquareIcon className="stroke-slate-300 w-4 h-4 hover:stroke-pink-500" />
            </div>
          )}
        </div>
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
            className="stroke-slate-500 w-5 h-5 hover:stroke-pink-500"
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
    <>
      <div className="w-full flex justify-end gap-2 mb-8">
        {inventoryData && inventoryData.length > 0 && (
          <>
            <Button version="primary" Icon={LightBulbIcon} iconLocation="left">
              Soldering Mode
            </Button>
            <Link to="version-history/">
              <Button version="primary">Version History</Button>
            </Link>
            <Button version="primary" onClick={handleDownloadCSV}>
              Download CSV
            </Button>
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
          <div className="text-gray-500 animate-pulse">Loading...</div>
        }
        columns={columns}
        data={inventoryData}
        progressPending={inventoryDataIsLoading}
        customStyles={customStyles}
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
  );
};

export default Inventory;
