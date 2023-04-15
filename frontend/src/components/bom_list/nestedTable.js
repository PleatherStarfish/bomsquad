import React, { useState } from "react";
import DataTable from "react-data-table-component";
import useGetComponents from "../../services/useGetComponents";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import Button from "../../ui/Button";
import InventoryQuantity from "./userQty";
import AddComponentModal from "./addComponentModal";
import useUserInventoryQuantity from '../../services/useGetUserInventoryQuantity';
import useGetUserShoppingListQuantity from '../../services/useGetUserShoppingListQuantity';

export const customStyles = {
  headCells: {
    style: {
      padding: "0 0.5rem 0 0.5rem",
      fontWeight: "bold",
      backgroundColor: "#f0f9ff",
      overflow: "unset !important",
    },
  },
  rows: {
    style: {
      backgroundColor: "#f0f9ff",
      padding: "0.2rem 0 0.2rem 0",
    },
  },
  cells: {
    style: {
      padding: "0 0.5rem 0 0.5rem",
    },
  },
};

const NestedTable = (props) => {
  const [shoppingModalOpen, setShoppingModalOpen] = useState();
  const [inventoryModalOpen, setInventoryModalOpen] = useState();

  const { user } = useAuthenticatedUser();
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponents(props.data.components_options);

  if (componentsAreError) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        Error loading components: {componentsAreError.message}
      </div>
    );
  }

  const columns = [
    {
      name: <div>Name</div>,
      selector: (row) => row.description,
      sortable: true,
      grow: 1,
      wrap: true,
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
      selector: (row) => (
        <a href={row.link} className="text-blue-500 hover:text-blue-700">
          {row.supplier_item_no}
        </a>
      ),
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Farads</div>,
      selector: (row) => row.farads,
      sortable: true,
      wrap: true,
      omit: props.data.type !== "Capacitor",
    },
    {
      name: <div>Ohms</div>,
      selector: (row) => row.ohms,
      sortable: true,
      wrap: true,
      omit: props.data.type !== "Resistor",
    },
    {
      name: <div>Price</div>,
      selector: (row) =>
      row.price && row.price_currency ? `${row.price} ${row.price_currency}` : row.price,
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
    {
      name: <div>Qty in Shopping List</div>,
      selector: (row) => <InventoryQuantity useHook={useGetUserShoppingListQuantity} hookArgs={[row.id, props.data.id, props.data.moduleId]} />,
      sortable: false,
      omit: !user,
      width: "80px",
    },
    {
      name: "",
      cell: (row) => {
        return (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setShoppingModalOpen(row.id);
              }}
            >
              Add to Shopping List
            </Button>
            <AddComponentModal
              open={shoppingModalOpen === row.id}
              setOpen={setShoppingModalOpen}
              title={`Add ${row.description} to Shopping List?`}
              text={
                <>
                  <span>
                    {`${props.data.moduleName} requires ${props.data.quantity} x
                    ${props.data.description}. How many `}
                  </span>
                  <span>
                    <a
                      href={row.link}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {`${row.description} ${props.data.type.toLowerCase()}s by ${row.supplier?.name} `}
                    </a>
                  </span>
                  <span>would you like to add to your shopping list to fulfill this BOM item?
                  </span>
                </>
              }
              quantityRequired={props.data.quantity}
              componentId={row.id}
            />
          </>
        );
      },
      button: true,
      sortable: false,
      omit: !user,
      ignoreRowClick: true,
      width: "160px",
    },
    {
      name: "",
      cell: (row) => {
        return (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInventoryModalOpen(row.id)}
            >
              Add to Inventory
            </Button>
            <AddComponentModal
              open={inventoryModalOpen === row.id}
              setOpen={setInventoryModalOpen}
              title={`Add ${row.supplier?.short_name} ${row.supplier_item_no} to Inventory?`}
              text={<>
                <span>
                  {`${props.data.moduleName} requires ${props.data.quantity} x
                  ${props.data.description}. How many `}
                </span>
                <span>
                  <a
                    href={row.link}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    {`${row.description} ${props.data.type.toLowerCase()}s by ${row.supplier?.name} `}
                  </a>
                </span>
                <span>would you like to add to your inventory to fulfill this BOM item?
                </span>
              </>}
              quantityRequired={props.data.quantity}
              componentId={row.id}
            />
          </>
        );
      },
      button: true,
      sortable: false,
      omit: !user,
      ignoreRowClick: true,
      width: "140px",
    },
  ];

  return (
    <div className="py-1 px-3 ml-[47px] bg-sky-50">
      <DataTable
        compact
        fixedHeader
        responsive
        subHeaderAlign="right"
        subHeaderWrap
        exportHeaders
        columns={columns}
        data={componentsData}
        progressPending={componentsAreLoading}
        customStyles={customStyles}
      />
    </div>
  );
};

export default NestedTable;
