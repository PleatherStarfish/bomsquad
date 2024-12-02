import { LightBulbIcon, TrashIcon, BookmarkSquareIcon, FolderArrowDownIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState, useRef, useMemo } from "react";

import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import DataTable, { TableColumn } from "react-data-table-component";
import EditableLocation from "./EditableLocation";
import EditableQuantity from "./EditableQuantity";
import Fuse from "fuse.js";
import { Link } from "react-router-dom";
import Modal from "../../ui/Modal";
import SearchInput from "./SearchInput";
import { SignpostSplit } from "react-bootstrap-icons";
import SolderingMode from "../SolderingMode";
import _ from "lodash";
import find  from "lodash/find";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useDeleteUserInventory from "../../services/useDeleteUserInventory";
import useGetUserInventory from "../../services/useGetUserInventory";
import useUpdateUserInventory from "../../services/useUpdateUserInventory";
import useAddOrUpdateUserInventory from "../../services/useAddOrUpdateUserInventory"
import FullPageModal from "../../ui/FullPageModal";
import Notification from "../../ui/Notification";
import AddComponentForm from "../../components/user_submissions/AddComponentForm";
import AsyncComponentSelect from "../components/AsyncComponentSelect"
import cv from "classnames"

type InventoryRow = {
  id: string;
  component: {
    description: string;
    manufacturer: { name: string };
    supplier: { name: string };
    supplier_item_no?: string;
    type?: { name: string };
    farads?: string;
    ohms?: string;
    unit_price?: string;
    price_currency?: string;
    tolerance?: string;
    voltage_rating?: string;
    link?: string;
    notes?: string;
  };
  location?: string[];
  quantity: number;
};

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
  row: InventoryRow,
  field: keyof InventoryRow,
  fieldIdToEdit: string | undefined,
  setFieldIdToEdit: React.Dispatch<React.SetStateAction<string | undefined>>,
  setUpdatedFieldToSubmit: React.Dispatch<React.SetStateAction<any>>
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
  const [error, setError] = useState<string | null>(null);
  const [quantityIdToEdit, setQuantityIdToEdit] = useState<string | undefined>();
  const [updatedQuantityToSubmit, setUpdatedQuantityToSubmit] = useState<number | undefined>();
  const [locationIdToEdit, setLocationIdToEdit] = useState<string | undefined>();
  const [updatedLocationToSubmit, setUpdatedLocationToSubmit] = useState<string | undefined>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dataToDelete, setDataToDelete] = useState<InventoryRow | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [dataSearched, setDataSearched] = useState<InventoryRow[] | undefined>();
  const [openSolderingMode, setOpenSolderingMode] = useState(false);
  const [fullPageModalOpen, setFullPageModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    message: "",
    show: false,
    title: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [isTopSectionValid, setIsTopSectionValid] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const { userIsLoading, userIsError } = useAuthenticatedUser();

  const { inventoryData, inventoryDataIsLoading, inventoryDataIsError } =
    useGetUserInventory();

  const { updateUserInventoryMutate } = useUpdateUserInventory();
  const { mutate: addOrUpdateInventory } = useAddOrUpdateUserInventory();


  const deleteMutation = useDeleteUserInventory();

  const handleTopSectionChange = () => {
    setIsTopSectionValid(Boolean(selectedComponent && updatedQuantityToSubmit && updatedQuantityToSubmit > 0));
  };

  const handleFormSubmit = () => {
    if (isTopSectionValid) {
      if (selectedComponent && updatedQuantityToSubmit && updatedQuantityToSubmit > 0) {
        const data = {
          editMode: false,
          location: null, 
          quantity: updatedQuantityToSubmit,
        };

        try {
          addOrUpdateInventory(
            {
              componentId: selectedComponent.value,
              data,
            },
            {
              onError: (error) => {
                console.error("Failed to add or update component:", error);
              },
              onSuccess: () => {
                console.log("Component added or updated successfully.");
                setSelectedComponent(null); // Reset selection
                setUpdatedQuantityToSubmit(undefined); // Reset quantity
              },
            }
          );
        } catch (error) {
          console.error("Error invoking mutation:", error);
        }
      } else {
        console.warn("Top section validation failed.");
      }
    } else if (formRef.current) {
      try {
        formRef.current.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    } else {
      console.warn("No valid form to submit.");
    }
  };

  const handleSuccess = () => {
    setFullPageModalOpen(false);
    setNotification({
      message: "Your new component has been successfully submitted.",
      show: true,
      title: "Component Added",
    });
  };

  const options: Fuse.IFuseOptions<InventoryRow> = {
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


  const fuse = useMemo(() => {
    return inventoryData && inventoryData.length > 0
      ? new Fuse(inventoryData, options)
      : undefined;
  }, [inventoryData, options]);

  const filteredData = useMemo(() => {
    if (!fuse || !searchTerm) {
      return inventoryData;
    }
    const results = fuse.search(searchTerm).map((result) => result.item);
    return results.filter((row) => row && row.id); // Ensure valid rows
  }, [fuse, searchTerm, inventoryData]);

  useEffect(() => {
    setDataSearched((prev) => {
      if (!_.isEqual(prev, filteredData)) {
        return filteredData;
      }
      return prev;
    });
  }, [filteredData]);
  
  const handleQuantityChange = useCallback(async (value: number) => {
    setUpdatedQuantityToSubmit(value);
  }, []);

  const handleSubmitQuantity = useCallback(async (inventoryPk: string) => {
    try {
      await updateUserInventoryMutate({ inventoryPk, quantity: updatedQuantityToSubmit });
      setQuantityIdToEdit(undefined);
      setUpdatedQuantityToSubmit(undefined);
    } catch (error) {
      console.error("Failed to update quantity", error);
    }
  }, [updatedQuantityToSubmit, updateUserInventoryMutate]);

  const handleLocationChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setUpdatedLocationToSubmit(event.target.value);
  }, []);

  const handleSubmitLocation = useCallback(async (inventoryPk: string) => {
    try {
      await updateUserInventoryMutate({ inventoryPk, location: updatedLocationToSubmit });
      setLocationIdToEdit(undefined);
      setUpdatedLocationToSubmit(undefined);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    }
  }, [updatedLocationToSubmit, updateUserInventoryMutate]);

  const handleDelete = useCallback(async (inventoryPk: string) => {
    try {
      deleteMutation.mutate({ inventoryPk });
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  }, [deleteMutation]);

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
      setError(error.response?.data?.error || "An error occurred");
    }
  }, []);

  if (userIsLoading)
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );

  if (inventoryDataIsError || userIsError) {
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

  const columns: TableColumn<InventoryRow>[] = [
    {
      grow: 1,
      name: "Name",
      selector: (row) => row.component.description,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => row.component.type?.name,
      hide: 1700,
      name: <div>Type</div>,
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
      cell: (row) => {
        return (
          <a
            className="text-blue-500 hover:text-blue-700"
            href={row.component.link}
          >
            {row.component?.supplier_item_no ? row.component?.supplier_item_no : "[ none ]"}
          </a>
        );
      },
      name: <div>Supp. Item #</div>,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => <span>{row.component.farads}</span>,
      name: <div>Farads</div>,
      // @ts-ignore
      omit: (row: InventoryRow) => row.component.type?.name !== "Capacitor",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => <span>{row.component.ohms}</span>,
      name: <div>Ohms</div>,
      // @ts-ignore
      omit: (row: InventoryRow) => row.component.type !== "Resistor",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) =>
        row.component.unit_price && row.component.price_currency
          ? `${row.component.unit_price} ${row.component.price_currency}`
          : row.component.unit_price,
      hide: 1700,
      name: <div>Price</div>,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => row.component.tolerance,
      hide: 1700,
      name: <div>Tolerance</div>,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => row.component.voltage_rating,
      hide: 1700,
      name: <div>V. Rating</div>,
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
              setDataToDelete({
                component: row.component,
                id: row.id,
                quantity: row.quantity,
              });
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
                    Icon={PlusCircleIcon}
                    iconLocation="left"
                    onClick={() => setFullPageModalOpen(true)}
                    variant="primary"
                  >
                    Add to database
                  </Button>
                  <Button
                    expandOnHover
                    Icon={LightBulbIcon}
                    iconLocation="left"
                    onClick={() => setOpenSolderingMode(true)}
                    variant="primary"
                  >
                    Soldering Mode
                  </Button>
                  <Link to="tree/">
                    <Button expandOnHover Icon={SignpostSplit} variant="primary">Locations Diagram</Button>
                  </Link>
                  <Link to="version-history/">
                    <Button expandOnHover Icon={BookmarkSquareIcon} variant="primary">Version History</Button>
                  </Link>
                  <Button
                    expandOnHover
                    Icon={FolderArrowDownIcon}
                    onClick={handleDownloadCSV}
                    variant="primary"
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
            data={(dataSearched ?? []).length ? dataSearched : inventoryData}
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
            // @ts-ignore
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
              handleDelete(dataToDelete?.id || "");
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
      <FullPageModal
        customButtons={
          <div className="flex justify-end space-x-4">
            <button
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => setFullPageModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-brandgreen-600 border border-transparent rounded-md shadow-sm hover:bg-brandgreen-700"
              onClick={handleFormSubmit}
            >
              <p className={cv({ "animate-pulse": isSubmitting })}>
                {isSubmitting ? "Submiting..." : "Submit"}
              </p>
            </button>
          </div>
        }
        onSubmit={() => {
          setFullPageModalOpen(false);
        }}
        open={fullPageModalOpen}
        setOpen={setFullPageModalOpen}
        submitButtonText="Save"
        subtitle={
          <p>
            New components can be added to your inventory and shopping list.
            They can be suggested as options for BOM list items. New components
            will be marked as &quot;pending&quot; until reviewed by the BOM
            Squad team.
          </p>
        }
        title="Add a Component"
      >
        <div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-lg text-left font-semibold leading-6 text-gray-900 pb-3 mt-1 font-display mb-3">Select a component from the database</h4>
            <div className="align-middle flex flex-wrap md:flex-nowrap gap-6 mb-6">
              <AsyncComponentSelect
                onChange={(selected) => {
                  setSelectedComponent(selected);
                  handleTopSectionChange();
                }}
                placeholder="Search..."
                value={selectedComponent}
              />
              <input
                className="h-[36px] w-24 p-2 border border-gray-300 rounded"
                min={1}
                onChange={(e) => {
                  setUpdatedQuantityToSubmit(Number(e.target.value));
                  handleTopSectionChange();
                }}
                placeholder="Qty"
                type="number"
                value={updatedQuantityToSubmit || ""}
              />
            </div>
          </div>
          <div className="relative flex items-center justify-center my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="px-4 text-gray-500 bg-white">OR</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg">
            <h4 className="text-lg text-left font-semibold leading-6 text-gray-900 mt-1 font-display">Add a component to the database</h4>
            <AddComponentForm
              allowInventoryOption
              formRef={formRef}
              handleSuccess={handleSuccess}
              isSubmitting={isSubmitting}
              setIsSubmitting={setIsSubmitting}
            />
          </div>
        </div>
      </FullPageModal>
      <Notification
        message={notification.message}
        setShow={(value) =>
          setNotification((prev) => ({
            ...prev,
            show: typeof value === "function" ? value(prev.show) : value,
          }))
        }
        show={notification.show}
        title={notification.title}
      />
    </>
  );
};

export default Inventory;
