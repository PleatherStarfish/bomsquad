import 'tippy.js/dist/tippy.css';

import Quantity, { Types } from "./quantity";
import React, { useState } from "react";
import getCurrencySymbol, { roundToCurrency } from "../../utils/currencies";
import { getFaradConversions, getOhmConversions } from '../conversions';

import AddComponentModal from "./addComponentModal";
import Button from "../../ui/Button";
import DataTable from "react-data-table-component";
import { FlagIcon } from "@heroicons/react/24/outline";
import Tippy from '@tippyjs/react';
import UserRating from "./UserRating";
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

const NestedTable = ({ data }) => {
  const {
    components_options,
    type,
    id: modulebomlistitem_pk,
    moduleId: module_pk,
    moduleName,
    quantity,
    description,
  } = data;

  const [shoppingModalOpen, setShoppingModalOpen] = useState();
  const [inventoryModalOpen, setInventoryModalOpen] = useState();

  if (components_options.length < 1) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        No components found for this BOM item.
      </div>
    );
  }

  const { user } = useAuthenticatedUser();
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponentsByIds(components_options);

  if (componentsAreError) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        Error loading components: {componentsAreError.message}
      </div>
    );
  }

  const columns = [
    {
      name: <small>Name</small>,
      selector: (row) => row.discontinued ? <span><s>{row.description}</s> <span className="italic font-bold text-red-500">DISCONTINUED</span></span> : <a className="text-blue-500 hover:text-blue-700" href={`${getBaseUrl()}/components/${row.id}`}>{row.description}</a>,
      sortable: true,
      grow: 1,
      wrap: true,
      minWidth: "200px",
    },
    {
      name: <small>Type</small>,
      selector: (row) => row.type?.name,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <small>Manufacturer</small>,
      selector: (row) => row.manufacturer?.name,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <small>Supplier</small>,
      selector: (row) => row.supplier?.name,
      sortable: true,
      wrap: true,
    },
    {
      name: <small>Supp. Item #</small>,
      selector: (row) => {
        return <a href={row.link} className="text-blue-500 hover:text-blue-700">
          {row?.supplier_item_no ? row?.supplier_item_no : "[ none ]"}
        </a>
    },
      sortable: true,
      wrap: true,
    },
    {
      name: <small>Farads</small>,
      selector: (row) => (
        <Tippy content={<div dangerouslySetInnerHTML={{ __html: getFaradConversions(row.farads, row.farads_unit) }} />}>
          <span>
            {row.farads} {row.farads_unit}
          </span>
        </Tippy>
      ),
      sortable: true,
      wrap: true,
      omit: type !== "Capacitor",
    },
    {
      name: <small>Ohms</small>,
      selector: (row) => (
        <Tippy content={<div dangerouslySetInnerHTML={{ __html: getOhmConversions(row.ohms, row.ohms_unit) }} />}>
          <span>
            {row.ohms} {row.ohms_unit}
          </span>
        </Tippy>
      ),
      sortable: true,
      wrap: true,
      omit: type !== "Resistor",
    },
    {
      name: <small>Forward Current</small>,
      selector: (row) => row.forward_current,
      sortable: true,
      wrap: true,
      omit: row => row.type.name !== "Diodes",
    },
    {
      name: <small>Forward Voltage</small>,
      selector: (row) => row.forward_voltage,
      sortable: true,
      wrap: true,
      omit: row => row.type.name !== "Diodes",
    },
    {
      name: <small>Forward Surge Current</small>,
      selector: (row) => row.forward_surge_current,
      sortable: true,
      wrap: true,
      omit: row => row.type.name !== "Diodes",
    },
    {
      name: <small>Forward Current Avg Rectified</small>,
      selector: (row) => row.forward_current_avg_rectified,
      sortable: true,
      wrap: true,
      omit: row => row.type.name !== "Diodes",
    },
    {
      name: <small>Price</small>,
      selector: (row) => {
        return (
          <span>
            {row.price_currency &&
              `${getCurrencySymbol(
                row.price_currency
              )}${roundToCurrency(
                row.price,
                row.price_currency
              )}`}
          </span>
        );
      },
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <small>Tolerance</small>,
      selector: (row) => row.tolerance,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <small>V. Rating</small>,
      selector: (row) => row.voltage_rating,
      sortable: true,
      wrap: true,
      hide: 1700,
    },
    {
      name: <small>Qty in User Inv.</small>,
      cell: (row) => (
        <Quantity
          useHook={useUserInventoryQuantity}
          hookArgs={{ component_pk: row.id }}
        />
      ),
      sortable: false,
      omit: !user,
      width: "85px",
    },
    {
      name: <small>Qty for project in Shopping List</small>,
      selector: (row) => (
        <Quantity
          useHook={useGetUserShoppingListQuantity}
          hookArgs={{
            component_pk: row.id,
            modulebomlistitem_pk,
            module_pk,
          }}
        />
      ),
      sortable: false,
      omit: !user,
      width: "85px",
    },
    {
      name: "",
      cell: (row) => (
        <UserRating 
          moduleBomListItemId={modulebomlistitem_pk} 
          componentId={row.id} 
          initialRating={0}
          moduleName={moduleName}
          bomItemName={description}
          tooltipText="Click to rate component. User ratings represent how well a component works for a specific BOM list item for a specific project. Rating are not a subjective measure of the quality of a component in abstract."
          moduleId={module_pk}
          transition
        />
      ),
      sortable: false,
      width: "90px",
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
              title={row.supplier_item_no ? `Add ${row.supplier?.short_name} ${row.supplier_item_no} to Inventory?` : `Add ${row.description} to Inventory?`}
              type={Types.INVENTORY}
              componentName={row.supplier_item_no ? `${row.supplier?.short_name} ${row.supplier_item_no}` : row.description}
              text={
                <>
                  <span>
                    {`${moduleName} requires ${quantity} x
                  ${description}. How many `}
                  </span>
                  <span>
                    <a
                      href={row.link}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {`${
                        row.description
                      } ${type.toLowerCase()}s by ${
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
              quantityRequired={quantity}
              componentId={row.id}
              moduleId={module_pk}
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
              componentName={row.supplier_item_no ? `${row.supplier?.short_name} ${row.supplier_item_no}` : row.description}
              type={Types.SHOPPING}
              hookArgs={{
                component_pk: row.id,
                modulebomlistitem_pk,
                module_pk,
              }}
              text={
                <>
                  <span>
                    {`${moduleName} requires ${quantity} x
                    ${description}. How many `}
                  </span>
                  <span>
                    <a
                      href={row.link}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {`${
                        row.description
                      } ${type.toLowerCase()}s by ${
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
              quantityRequired={quantity}
              componentId={row.id}
              moduleId={module_pk}
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
