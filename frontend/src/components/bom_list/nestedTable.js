import Quantity, { Types } from "./quantity";
import React, { useState } from "react";
import getCurrencySymbol, { roundToCurrency } from "../../utils/currencies";

import AddComponentModal from "./addComponentModal";
import Button from "../../ui/Button";
import DataTable from "react-data-table-component";
import { FlagIcon } from "@heroicons/react/24/outline";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useGetComponentsByIds from "../../services/useGetComponentsByIds";
import useGetUserShoppingListQuantity from "../../services/useGetUserShoppingListQuantity";
import useUserInventoryQuantity from "../../services/useGetUserInventoryQuantity";

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

const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

const NestedTable = (props) => {
  const [shoppingModalOpen, setShoppingModalOpen] = useState();
  const [inventoryModalOpen, setInventoryModalOpen] = useState();

  if (props.data.components_options.length < 1) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        No components found for this BOM item.
      </div>
    );
  }

  const { user } = useAuthenticatedUser();
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponentsByIds(props.data.components_options);

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
      selector: (row) => row.discontinued ? <span><s>{row.description}</s> <span className="italic font-bold text-red-500">DISCONTINUED</span></span> : <a href={`${getBaseUrl()}/components/${row.id}`}>{row.description}</a>,
      sortable: true,
      grow: 1,
      wrap: true,
      minWidth: "200px",
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
      selector: (row) => {
        return (
          <span>
            {row.component?.price_currency &&
              `${getCurrencySymbol(
                row.component.price_currency
              )}${roundToCurrency(
                row.component.price,
                row.component.price_currency
              )}`}
          </span>
        );
      },
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
          hookArgs={{ component_pk: row.id }}
        />
      ),
      sortable: false,
      omit: !user,
      width: "80px",
    },
    {
      name: <div>Qty in Shopping List</div>,
      selector: (row) => (
        <Quantity
          useHook={useGetUserShoppingListQuantity}
          hookArgs={{
            component_pk: row.id,
            modulebomlistitem_pk: props.data.id,
            module_pk: props.data.moduleId,
          }}
        />
      ),
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
              size="xs"
              onClick={() => setInventoryModalOpen(row.id)}
            >
              + Inventory
            </Button>
            <AddComponentModal
              open={inventoryModalOpen === row.id}
              setOpen={setInventoryModalOpen}
              title={`Add ${row.supplier?.short_name} ${row.supplier_item_no} to Inventory?`}
              type={Types.INVENTORY}
              componentName={`${row.supplier?.short_name} ${row.supplier_item_no}`}
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
                      {`${
                        row.description
                      } ${props.data.type.toLowerCase()}s by ${
                        row.supplier?.name
                      } `}
                    </a>
                  </span>
                  <span>
                    would you like to add to your inventory to fulfill this BOM
                    item?
                  </span>
                </>
              }
              quantityRequired={props.data.quantity}
              componentId={row.id}
              moduleId={props.data.moduleId}
            />
          </>
        );
      },
      button: true,
      sortable: false,
      omit: !user,
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
              title={`Add ${row.description} to Shopping List?`}
              componentName={`${row.supplier?.short_name} ${row.supplier_item_no}`}
              type={Types.SHOPPING}
              hookArgs={{
                component_pk: row.id,
                modulebomlistitem_pk: props.data.id,
                module_pk: props.data.moduleId,
              }}
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
                      {`${
                        row.description
                      } ${props.data.type.toLowerCase()}s by ${
                        row.supplier?.name
                      } `}
                    </a>
                  </span>
                  <span>
                    would you like to add to your shopping list to fulfill this
                    BOM item?
                  </span>
                </>
              }
              quantityRequired={props.data.quantity}
              componentId={row.id}
              moduleId={props.data.moduleId}
            />
          </>
        );
      },
      button: true,
      sortable: false,
      omit: !user,
      ignoreRowClick: true,
      width: "115px",
    },
    {
      name: "",
      cell: (row) => {
        return (
          <span className="invisible group-hover/row:visible">
            <a href="https://forms.gle/5avb2JmrxJT2uw426" target="_blank">
              <Button
                variant="link"
                size="xs"
                iconOnly
                Icon={FlagIcon}
                tooltipText="Report problem with component data"
              >
                Report problem with component data
              </Button>
            </a>
          </span>
        );
      },
      width: "70px",
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => true,
      classNames: ["group/row"],
    },
  ];

  return (
    <div className="py-1 px-3 ml-[47px] bg-sky-50">
      <DataTable
        compact
        columns={columns}
        data={componentsData}
        progressPending={componentsAreLoading}
        conditionalRowStyles={conditionalRowStyles}
        progressComponent={
          <div className="flex justify-center w-full p-6 bg-sky-50">
            <div className="text-center text-gray-500 animate-pulse">
              Loading...
            </div>
          </div>
        }
        customStyles={customStyles}
      />
    </div>
  );
};

export default NestedTable;
