import React from "react";
import DataTable from "react-data-table-component";
import useGetComponents from "../services/useGetComponents";
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import InventoryQuantity from "../components/bom_list/userQty";
import useUserInventoryQuantity from "../services/useGetUserInventoryQuantity";
import Alert from "../ui/Alert";

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
  const { user } = useAuthenticatedUser();
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponents();

  if (componentsAreError) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        Error loading components: {componentsAreError.message}
      </div>
    );
  }

  const columns = [
    {
      name: "Name",
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
      grow: 1,
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
            {row.supplier_item_no}
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
    },
    {
      name: <div>Ohms</div>,
      selector: (row) => row.ohms,
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
        cell: (row) => <InventoryQuantity useHook={useUserInventoryQuantity} hookArgs={[row.id]} />,
        sortable: false,
        omit: !user,
        width: "80px",
      },
  ];

  return (
    <div className="mb-8">
      <div class="w-full py-12">
        <div id="dataElem" class="bg-gray-100 p-10 rounded-lg">
          <form method="get">
            <div class="flex flex-col -mx-2">
              <div class="w-full mb-6 md:w-1/2 lg:w-1/3 px-2 mb-4 md:mb-0">
                <label
                  for="search"
                  class="block text-md font-semibold text-gray-700 mb-2"
                >
                  Search by name
                </label>
                <input
                  type="text"
                  name="search"
                  placeholder="Search"
                  id="search"
                  autocomplete="off"
                  class="w-full pl-2 border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500 h-8 border border-gray-300"
                />
              </div>
              <div class="w-48 px-2 mt-6 mb-4 md:mb-0">
                <label
                  for="manufacturer"
                  class="block text-md font-semibold text-gray-700 mb-2"
                >
                  Manufacturer
                </label>
                <select
                  name="manufacturer"
                  id="manufacturer"
                  class="w-full mb-6 border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500 h-8 border border-gray-300"
                >
                  <option
                    value=""
                    class="text-brandgreen-500 hover:bg-brandgreen-100 hover:text-gray-800"
                  >
                    All manufacturers
                  </option>
                </select>
              </div>
              <div class="w-full md:w-1/2 lg:w-1/3 px-2">
                <button
                  type="submit"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-brandgreen-500 hover:bg-brandgreen-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandgreen-500"
                >
                  Search
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <h1 className="my-6 text-3xl">Components</h1>
      {!!user || (
        <div className="mb-8">
          <Alert variant="warning">
            <div className="alert alert-warning" role="alert">
              <a href="/accounts/login/" className="text-blue-500 hover:text-blue-700">
                <b>Login</b>
              </a>{" "}
              to add components to your shopping list and inventory.
            </div>
          </Alert>
        </div>
      )}
      <DataTable
        fixedHeader
        pagination
        responsive
        subHeaderAlign="right"
        subHeaderWrap
        exportHeaders
        progressComponent={
          <div className="text-gray-700 animate-pulse">Loading...</div>
        }
        columns={columns}
        data={componentsData}
        progressPending={componentsAreLoading}
        customStyles={customStyles}
      />
    </div>
  );
};

export default Components;
