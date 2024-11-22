import 'tippy.js/dist/tippy.css';

import Quantity, { Types } from "../components/bom_list/quantity";
import React, { useEffect, useState } from "react";
import { getFaradConversions, getOhmConversions } from '../components/conversions';
import useGetUserCurrency from "../services/useGetUserCurrency";

import AddComponentModal from "../components/bom_list/addComponentModal";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import DataTable, { TableColumn } from "react-data-table-component";
import Pagination from "../components/components/Pagination";
import SearchForm from "../components/components/SearchForm";
import Tippy from '@tippyjs/react';
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import { useForm } from "react-hook-form";
import useGetComponents from "../services/useGetComponents";
import useGetUserAnonymousShoppingListQuantity from "../services/useGetUserAnonymousShoppingListQuantity";
import useUserInventoryQuantity from "../services/useGetUserInventoryQuantity";
import { Component } from "../types/component"

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

const Components: React.FC = () => {
  const { register, handleSubmit, control } = useForm();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [shoppingModalOpen, setShoppingModalOpen] = useState<string | undefined>();
  const [inventoryModalOpen, setInventoryModalOpen] = useState<string | undefined>();

  const { user } = useAuthenticatedUser();
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponents({
      filters: Object.fromEntries(
        Object.entries(formData).filter(([key]) => key !== "search")
      ),
      order: null,
      page: currentPage,
      search: formData?.search,
    });
    const { data: userCurrency } = useGetUserCurrency();

  useEffect(() => {
    if (componentsData?.page) {
      setCurrentPage(componentsData.page);
    }
  }, [componentsData?.page]);

  if (componentsAreError) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        Error
      </div>
    );
  }

  const onSubmit = (data: Record<string, any>) => {
    const updatedFormData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key,
        value === "all" ? undefined : value,
      ])
    );
    setFormData(updatedFormData);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > (componentsData?.total_pages || 0)) return;
    setCurrentPage(newPage);
  };

  const resultsPerPage = 30;
  const totalPages = Math.ceil((componentsData?.count || 0) / resultsPerPage);

  const columns: TableColumn<Component>[] = [
    {
      cell: (row: Component) => <a className="text-blue-500 hover:text-blue-700" href={`${getBaseUrl()}/components/${row.id}`}>{row.description}</a>,
      grow: 1,
      minWidth: "250px",
      name: "Name",
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Type</div>,
      selector: (row: Component) => row.type?.name,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Manufacturer</div>,
      selector: (row: Component) => row.manufacturer?.name || "",
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Supplier</div>,
      selector: (row: Component) => row.supplier?.name || "",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row: Component) => {
        return (
          <a className="text-blue-500 hover:text-blue-700" href={row.link}>
            {row?.supplier_item_no ? row?.supplier_item_no : "[ none ]"}
          </a>
        );
      },
      name: <div>Supp. Item #</div>,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row: Component) => (
        row.farads ? (
          <Tippy content={<div dangerouslySetInnerHTML={{ __html: getFaradConversions(row.farads, row.farads_unit) }} />}>
            <span>{row.farads} {row.farads_unit || 'µF'}</span>
          </Tippy>
        ) : ""
      ),
      name: <div>Farads</div>,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row: Component) => (
        row.ohms ? (
          <Tippy content={<div dangerouslySetInnerHTML={{ __html: getOhmConversions(row.ohms, row.ohms_unit) }} />}>
            <span>{row.ohms} {row.ohms_unit || 'Ω'}</span>
          </Tippy>
        ) : ""
      ),
      name: <div>Ohms</div>,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row: Component) => {
        if (!row.unit_price) return "N/A";

        const symbol = userCurrency?.currency_symbol || "$";
        return `${symbol}${row.unit_price}`;
      },
      name: <div>Price</div>,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Tolerance</div>,
      selector: (row: Component) => row.tolerance || "",
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>V. Rating</div>,
      selector: (row: Component) => row.voltage_rating || "",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row: Component) => (
        <Quantity
          hideLoadingTag
          hookArgs={{ componentId: row.id }}
          useHook={useUserInventoryQuantity}
        />
      ),
      name: <div>Qty in User Inv.</div>,
      omit: !user?.username,
      sortable: false,
      width: "80px",
    },
    {
      cell: (row: Component) => (
        <Quantity
          hideLoadingTag
          hookArgs={{ componentId: row.id }}
          useHook={useGetUserAnonymousShoppingListQuantity}
        />
      ), 
      name: <div>Qty in Shopping List</div>,
      omit: !user?.username,
      sortable: false,
      width: "80px",
    },
    {
      button: true,
      cell: (row: Component) => {
        return (
          <>
            <Button
              onClick={() => setInventoryModalOpen(row.id)}
              size="xs"
              variant="primary"
            >
              + Inventory
            </Button>
            <AddComponentModal
              componentId={row.id}
              componentName={row.supplier_item_no ? `${row.supplier?.short_name} ${row.supplier_item_no}` : row.description}
              open={inventoryModalOpen === row.id}
              quantityRequired={1}
              setOpen={setInventoryModalOpen}
              text={`Add ${row.description} (${row.supplier?.short_name} ${row.supplier_item_no}) to your inventory?`}
              title={row.supplier_item_no ? `Add ${row.supplier?.short_name} ${row.supplier_item_no} to Inventory?` : `Add ${row.description} to Inventory?`}
              type={Types.INVENTORY}
            />
          </>
        );
      },
      ignoreRowClick: true,
      name: "",
      omit: !user?.username,
      sortable: false,
      width: "95px",
    },
    {
      button: true,
      cell: (row: Component) => {
        return (
          <>
            <Button
              onClick={() => {
                setShoppingModalOpen(row.id);
              }}
              size="xs"
              variant="primary"
            >
              + Shopping List
            </Button>
            <AddComponentModal
              componentId={row.id}
              componentName={`${row.supplier?.short_name} ${row.supplier_item_no}`}
              open={shoppingModalOpen === row.id}
              quantityRequired={1}
              setOpen={setShoppingModalOpen}
              text=""
              title={`Add ${row.supplier?.short_name} ${row.supplier_item_no} to Shopping List?`}
              type={Types.SHOPPING_ANON}
            />
          </>
        );
      },
      ignoreRowClick: true,
      name: "",
      omit: !user?.username,
      sortable: false,
      width: "115px",
    },
  ];

  return (
    <div className="mb-8">
      <div className="w-full py-12">
        <div className="p-10 bg-gray-100 rounded-lg" id="dataElem">
          <SearchForm
            control={control}
            farads={componentsData?.unique_values?.farads ?? []}
            handleSubmit={handleSubmit}
            manufacturer={componentsData?.unique_values?.manufacturer ?? []}
            mounting_style={componentsData?.unique_values?.mounting_style ?? []}
            ohms={componentsData?.unique_values?.ohms ?? []}
            onSubmit={onSubmit}
            register={register}
            supplier={componentsData?.unique_values?.supplier ?? []} 
            tolerance={componentsData?.unique_values?.tolerance ?? []} 
            type={componentsData?.unique_values?.type ?? []}
            voltage_rating={componentsData?.unique_values?.voltage_rating ?? []}
          />
        </div>
      </div>
      <h1 className="my-6 text-3xl">Components</h1>
      {!!user?.username || (
        <div className="mb-8">
          <Alert variant="warning">
            <div className="alert alert-warning" role="alert">
              <a
                className="text-blue-500 hover:text-blue-700"
                href="/accounts/login/"
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
          columns={columns}
          customStyles={customStyles}
          data={componentsData?.results}
          exportHeaders
          fixedHeader
          progressComponent={
            <div className="text-center text-gray-500 animate-pulse">
              Loading...
            </div>
          }
          progressPending={componentsAreLoading}
          responsive
          // @ts-ignore
          subHeaderAlign="right"
          subHeaderWrap
        />
      </div>
      {componentsData?.results && (
        <div className="flex items-center justify-between py-4 bg-white border-t border-gray-200">
          <div className="flex justify-between flex-1 sm:hidden">
            <a
              className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </a>
            <a
              className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => handlePageChange(currentPage + 1)}
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
              navigate={handlePageChange}
              totalPages={totalPages}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Components;
