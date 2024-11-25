import 'tippy.js/dist/tippy.css';

import DataTable, { TableColumn } from "react-data-table-component";
import { FlagIcon, LinkIcon } from "@heroicons/react/24/outline";
import Quantity, { Types } from "./quantity";
import React, { useState } from "react";
import { getFaradConversions, getOhmConversions } from '../conversions';

import AddComponentModal from "./addComponentModal";
import Alert from "../../ui/Alert";
import { BomItem } from "../../types/bomListItem";
import Button from "../../ui/Button";
import { Component } from "../../types/component";
import Tippy from '@tippyjs/react';
import UserRating from "./UserRating";
import convertUnitPrice from "../../utils/convertUnitPrice"
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useGetComponentsByIds from "../../services/useGetComponentsByIds";
import useGetUserCurrency from "../../services/useGetUserCurrency"
import useGetUserShoppingListQuantity from "../../services/useGetUserShoppingListQuantity";
import useUserInventoryQuantity from "../../services/useGetUserInventoryQuantity";

interface NestedTableProps {
  data: BomItem;
}

export const customStyles = {
  cells: {
    style: {
      padding: "0 0.5rem 0 0.5rem",
    },
  },
  headCells: {
    style: {
      backgroundColor: "#f0f9ff",
      fontWeight: "bold",
      overflow: "unset !important",
      padding: "0 0.5rem 0 0.5rem",
    },
  },
  rows: {
    style: {
      backgroundColor: "#f0f9ff",
      padding: "0.2rem 0 0.2rem 0",
    },
  },
};

const getBaseUrl = (): string => {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

const NestedTable: React.FC<NestedTableProps> = ({ data }) => {
  const {
    bom_specifies_a_choice_of_values,
    components_options,
    bom_link,
    type,
    id: modulebomlistitem_pk,
    moduleId: module_pk,
    moduleName,
    quantity,
    description,
  } = data;

  const [shoppingModalOpen, setShoppingModalOpen] = useState<string | undefined>();
  const [inventoryModalOpen, setInventoryModalOpen] = useState<string | undefined>();

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
  const { data: currencyData } = useGetUserCurrency();

  if (componentsAreError) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        Error loading components.
      </div>
    );
  }

  const columns: TableColumn<Component>[] = [
    {
      cell: (row) => row.discontinued ? <span><s>{row.description}</s> <span className="italic font-bold text-red-500">DISCONTINUED</span></span> : <a className="text-blue-500 hover:text-blue-700" href={`${getBaseUrl()}/components/${row.id}`}>{row.description}</a>,
      grow: 1,
      minWidth: "200px",
      name: <small>Name</small>,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <small>Type</small>,
      selector: (row) => row.type?.name || "Unknown",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => row.manufacturer?.name,
      hide: 1700,
      name: <small>Manufacturer</small>,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) =>
        (row.supplier_items || []).length > 0 ? (
          <ul className="pl-5 list-disc">
            {row.supplier_items?.map((item) => (
              <li key={item.id}>
                <b>{item.supplier?.short_name}: </b>
                {item.supplier_item_no ? (
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    href={item.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.supplier_item_no}
                  </a>
                ) : (
                  <a
                    className="flex items-center text-blue-500 hover:text-blue-700"
                    href={item.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LinkIcon className="inline-block w-4 h-4" />
                  </a>
                )}
                {item.unit_price && (
                  <span className="text-xs text-gray-600">
                    {" "}
                    ({convertUnitPrice(item.unit_price, currencyData)})
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          "No supplier items"
        ),
      name: <small>Supplier Items</small>,
    },    
    {
      cell: (row) => (
        <Tippy content={<div dangerouslySetInnerHTML={{ __html: getFaradConversions(row.farads, row.farads_unit) }} />}>
          <span>
            {row.farads} {row.farads_unit}
          </span>
        </Tippy>
      ),
      name: <small>Farads</small>,
      omit: type.name !== "Capacitor",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => (
        <Tippy content={<div dangerouslySetInnerHTML={{ __html: getOhmConversions(row.ohms, row.ohms_unit) }} />}>
          <span>
            {row.ohms} {row.ohms_unit}
          </span>
        </Tippy>
      ),
      name: <small>Ohms</small>,
      omit: type.name !== "Resistor",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => row.forward_voltage,
      name: <small>Forward Voltage</small>,
      omit: type.name !== "Diodes",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => row.max_forward_current,
      name: <small>Max Forward Current</small>,
      omit: type.name !== "Diodes",
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <small>Tolerance</small>,
      selector: (row) => row.tolerance || "",
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <small>V. Rating</small>,
      selector: (row) => row.voltage_rating || "",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => (
        <Quantity
          hookArgs={{ component_pk: row.id }}
          useHook={useUserInventoryQuantity}
        />
      ),
      name: <small>Qty in User Inv.</small>,
      omit: !user,
      sortable: false,
      width: "85px",
    },
    {
      cell: (row) => (
        <Quantity
          hookArgs={{
            component_pk: row.id,
            module_pk,
            modulebomlistitem_pk,
          }}
          useHook={useGetUserShoppingListQuantity}
        />
      ),
      name: <small>Qty for project in Shopping List</small>,
      omit: !user,
      sortable: false,
      width: "85px",
    },
    {
      cell: (row) => (
        <UserRating 
          bomItemName={description} 
          componentId={row.id} 
          initialRating={0}
          moduleBomListItemId={modulebomlistitem_pk}
          moduleId={module_pk}
          moduleName={moduleName}
          tooltipText="Click to rate component. User ratings represent how well a component works for a specific BOM list item for a specific project. Rating are not a subjective measure of the quality of a component in abstract."
        />
      ),
      name: "",
      sortable: false,
      width: "90px",
    },
    {
      button: true,
      cell: (row) => {
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
              // @ts-ignore
              moduleId={module_pk}
              open={inventoryModalOpen === row.id}
              quantityRequired={quantity}
              setOpen={setInventoryModalOpen}
              text={
                <>
                  <span>
                    {`${moduleName} requires ${quantity} x
                  ${description}. How many `}
                  </span>
                  <span>
                    <a
                      className="text-blue-500 hover:text-blue-700"
                      href={row.link}
                    >
                      {`${
                        row.description
                        // @ts-ignore
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
              title={row.supplier_item_no ? `Add ${row.supplier?.short_name} ${row.supplier_item_no} to Inventory?` : `Add ${row.description} to Inventory?`}
              type={Types.INVENTORY}
            />
          </>
        );
      },
      ignoreRowClick: true,
      name: "",
      omit: !user,
      sortable: false,
      width: "95px",
    },
    {
      button: true,
      cell: (row) => {
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
              componentName={row.supplier_item_no ? `${row.supplier?.short_name} ${row.supplier_item_no}` : row.description}
              // @ts-ignore
              hookArgs={{
                component_pk: row.id,
                module_pk,
                modulebomlistitem_pk,
              }}
              moduleId={module_pk}
              open={shoppingModalOpen === row.id}
              quantityRequired={quantity}
              setOpen={setShoppingModalOpen}
              text={
                <>
                  <span>
                    {`${moduleName} requires ${quantity} x
                    ${description}. How many `}
                  </span>
                  <span>
                    <a
                      className="text-blue-500 hover:text-blue-700"
                      href={row.link}
                    >
                      {`${
                        row.description
                        // @ts-ignore
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
              title={`Add ${row.description} to Shopping List?`}
              type={Types.SHOPPING}
            />
          </>
        );
      },
      ignoreRowClick: true,
      name: "",
      omit: !user,
      sortable: false,
      width: "115px",
    },
    {
      cell: () => {
        return (
          <span className="invisible group-hover/row:visible">
            <a href="https://forms.gle/5avb2JmrxJT2uw426" rel="noreferrer" target="_blank">
              <Button
                Icon={FlagIcon}
                iconOnly
                size="xs"
                tooltipText="Report problem with component data"
                variant="link"
              >
                Report problem with component data
              </Button>
            </a>
          </span>
        );
      },
      name: "",
      width: "70px",
    },
  ];

  const conditionalRowStyles = [
    {
      classNames: ["group/row"],
      when: () => true,
    },
  ];

  return (
    <div className="py-1 px-4 ml-[47px] bg-sky-50">
      {bom_specifies_a_choice_of_values && (
        <Alert align="center" expand={false} icon padding="compact" variant="sky">
          <p>
          This BOM item specifies a choice of several different component value options. Please check <a className="underline hover:text-sky-800" href={bom_link} rel="noreferrer" target="_blank">the BOM</a> for details.
          </p>
        </Alert>
      )}
      <DataTable
        columns={columns}
        compact
        conditionalRowStyles={conditionalRowStyles}
        customStyles={customStyles}
        // @ts-ignore
        data={componentsData}
        progressComponent={
          <div className="flex justify-center w-full p-6 bg-sky-50">
            <div className="text-center text-gray-500 animate-pulse">
              Loading...
            </div>
          </div>
        }
        progressPending={componentsAreLoading}
      />
    </div>
  );
};

export default NestedTable;
