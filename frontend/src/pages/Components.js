import 'tippy.js/dist/tippy.css';

import Quantity, { Types } from "../components/bom_list/quantity";
import React, { useEffect, useState } from "react";
import { getFaradConversions, getOhmConversions } from '../components/conversions';

import AddComponentModal from "../components/bom_list/addComponentModal";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import DataTable from "react-data-table-component";
import Pagination from "../components/components/Pagination";
import SearchForm from "../components/components/SearchForm";
import Tippy from '@tippyjs/react';
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import { useForm } from "react-hook-form";
import useGetComponents from "../services/useGetComponents";
import useGetUserAnonymousShoppingListQuantity from "../services/useGetUserAnonymousShoppingListQuantity";
import useUserInventoryQuantity from "../services/useGetUserInventoryQuantity";

const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
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

const Components = () => {
  const { register, handleSubmit, control, watch } = useForm();
  const [currentPage, setCurrentPage] = useState(1); // state for the current page, initially 1
  const [formData, setFormData] = useState({});
  
  const [shoppingModalOpen, setShoppingModalOpen] = useState();
  const [inventoryModalOpen, setInventoryModalOpen] = useState();

  const { user } = useAuthenticatedUser();
  
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponents({page: currentPage, search: formData?.search, filters: Object.fromEntries(
      Object.entries(formData).filter(([key]) => key !== 'search')
    )});

  useEffect(() => {
    if (componentsData?.page) {
      // update page number with the current page number from the response
      setCurrentPage(componentsData?.page); // use setCurrentPage instead of setPage
    }
  }, [componentsData?.page]);

  if (componentsAreError) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        Error: {componentsAreError.message}
      </div>
    );
  }

  const onSubmit = (data) => {
    const updatedFormData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (value === 'all') {
          return [key, undefined];
        }
        return [key, value];
      })
    );
  
    setFormData(updatedFormData);
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > componentsData.total_pages) {
      return;
    }
    setCurrentPage(newPage); // use setCurrentPage instead of setPage
  };

  const resultsPerPage = 30;
  const totalPages = Math.ceil(componentsData?.count / resultsPerPage);

  const columns = [
    {
      name: "Name",
      selector: (row) => <a className="text-blue-500 hover:text-blue-700" href={`${getBaseUrl()}/components/${row.id}`}>{row.description}</a>,
      sortable: true,
      wrap: true,
      grow: 1,
      minWidth: "250px",
    },
    {
      name: <div>Type</div>,
      selector: (row) => row.type?.name,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>Manufacturer</div>,
      selector: (row) => row.manufacturer?.name,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>Supplier</div>,
      selector: (row) => row.supplier?.name,
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Supp. Item #</div>,
      selector: (row) => {
        return (
          <a href={row.link} className="text-blue-500 hover:text-blue-700">
            {row?.supplier_item_no ? row?.supplier_item_no : "[ none ]"}
          </a>
        );
      },
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Farads</div>,
      selector: (row) => (
        row.farads ? (
          <Tippy content={<div dangerouslySetInnerHTML={{ __html: getFaradConversions(row.farads, row.farads_unit) }} />}>
            <span>{row.farads} {row.farads_unit || 'µF'}</span>
          </Tippy>
        ) : ""
      ),
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Ohms</div>,
      selector: (row) => (
        row.ohms ? (
          <Tippy content={<div dangerouslySetInnerHTML={{ __html: getOhmConversions(row.ohms, row.ohms_unit) }} />}>
            <span>{row.ohms} {row.ohms_unit || 'Ω'}</span>
          </Tippy>
        ) : ""
      ),
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Price</div>,
      selector: (row) =>
        row.price && row.price_currency
          ? `${row.price} ${row.price_currency}`
          : row.price,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>Tolerance</div>,
      selector: (row) => row.tolerance,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>V. Rating</div>,
      selector: (row) => row.voltage_rating,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <div>Qty in User Inv.</div>,
      cell: (row) => (
        <Quantity
          useHook={useUserInventoryQuantity}
          hookArgs={{ componentId: row.id }}
        />
      ),
      sortable: false,
      omit: !user?.username,
      width: "80px",
    },
    {
      name: <div>Qty in Shopping List</div>, // componentPk, moduleBomListItemPk, modulePk
      selector: (row) => (
        <Quantity
          useHook={useGetUserAnonymousShoppingListQuantity}
          hookArgs={{ componentId: row.id }}
        />
      ),
      sortable: false,
      omit: !user?.username,
      width: "80px",
    },
    {
      name: "",
      cell: (row) => {
        return (
          <>
            <Button
              variant="primary"
              size="xs"
              onClick={() => setInventoryModalOpen(row.id)}
            >
              + Inventory
            </Button>
            <AddComponentModal
              open={inventoryModalOpen === row.id}
              setOpen={setInventoryModalOpen}
              componentName={row.supplier_item_no ? `${row.supplier?.short_name} ${row.supplier_item_no}` : row.description}
              title={row.supplier_item_no ? `Add ${row.supplier?.short_name} ${row.supplier_item_no} to Inventory?` : `Add ${row.description} to Inventory?`}
              // text={`Add ${row.description} (${row.supplier?.short_name} ${row.supplier_item_no}) to your inventory?`}
              type={Types.INVENTORY}
              quantityRequired={1}
              componentId={row.id}
              moduleId={null}
            />
          </>
        );
      },
      button: true,
      sortable: false,
      omit: !user?.username,
      ignoreRowClick: true,
      width: "95px",
    },
    {
      name: "",
      cell: (row) => {
        return (
          <>
            <Button
              variant="primary"
              size="xs"
              onClick={() => {
                setShoppingModalOpen(row.id);
              }}
            >
              + Shopping List
            </Button>
            <AddComponentModal
              open={shoppingModalOpen === row.id}
              setOpen={setShoppingModalOpen}
              componentName={`${row.supplier?.short_name} ${row.supplier_item_no}`}
              title={`Add ${row.supplier?.short_name} ${row.supplier_item_no} to Shopping List?`}
              type={Types.SHOPPING_ANON}
              // text={`Add ${row.description} to your shopping list?`}
              quantityRequired={1}
              componentId={row.id}
              moduleId={null}
            />
          </>
        );
      },
      button: true,
      sortable: false,
      omit: !user?.username,
      ignoreRowClick: true,
      width: "115px",
    },
  ];

  return (
    <div className="mb-8">
      <div className="w-full py-12">
        <div id="dataElem" className="p-10 bg-gray-100 rounded-lg">
          <SearchForm
            type={componentsData?.unique_values?.type ?? []}
            manufacturer={componentsData?.unique_values?.manufacturer ?? []}
            supplier={componentsData?.unique_values?.supplier ?? []}
            mounting_style={componentsData?.unique_values?.mounting_style ?? []}
            ohms={componentsData?.unique_values?.ohms ?? []}
            farads={componentsData?.unique_values?.farads ?? []}
            tolerance={componentsData?.unique_values?.tolerance ?? []}
            voltage_rating={componentsData?.unique_values?.voltage_rating ?? []}
            register={register} 
            handleSubmit={handleSubmit} 
            control={control}
            onSubmit={onSubmit}
          />
        </div>
      </div>
      <h1 className="my-6 text-3xl">Components</h1>
      {!!user?.username || (
        <div className="mb-8">
          <Alert variant="warning">
            <div className="alert alert-warning" role="alert">
              <a
                href="/accounts/login/"
                className="text-blue-500 hover:text-blue-700"
              >
                <b>Login</b>
              </a>{" "}
              to add components to your shopping list and inventory.
            </div>
          </Alert>
        </div>
      )}
      <div id="table__wrapper">
        <DataTable
          fixedHeader
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
          data={componentsData?.results}
          progressPending={componentsAreLoading}
          customStyles={customStyles}
        />
      </div>
      {componentsData?.results && (
        <div className="flex items-center justify-between py-4 bg-white border-t border-gray-200">
          <div className="flex justify-between flex-1 sm:hidden">
            <a
              onClick={() => handlePageChange(currentPage - 1)}
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Previous
            </a>
            <a
              onClick={() => handlePageChange(currentPage + 1)}
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Next
            </a>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {((currentPage || 1) - 1) * 10 + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">{(currentPage || 1) * 10}</span>{" "}
                of{" "}
                <span className="font-medium">
                  {componentsData?.count || 0}
                </span>{" "}
                results
              </p>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              navigate={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Components;
