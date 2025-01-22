import React, { useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Tippy from "@tippyjs/react";
import { FlagIcon, LinkIcon } from "@heroicons/react/24/outline";
import { SuggestedComponent } from "../../services/useGetSuggestedComponentsList";
import { customStyles } from "./NestedTable";
import { getFaradConversions, getOhmConversions } from "../conversions";
import convertUnitPrice from "../../utils/convertUnitPrice";
import Quantity, { Types } from "./quantity";
import useUserInventoryQuantity from "../../services/useGetUserInventoryQuantity";
import useGetUserShoppingListQuantity from "../../services/useGetUserShoppingListQuantity";
import UserRating from "./UserRating";
import Button from "../../ui/Button";
import Accordion from "../../ui/Accordion";
import AddComponentModal from "./addComponentModal";

interface UserSuggestedComponentsTableProps {
  data: SuggestedComponent[];
  moduleBomListItemId: string;
  moduleId: string;
  moduleName: string;
  bomItemDescription: string;
  userCurrency?: any; // Pass in currency data if necessary
}

const UserSuggestedComponentsTable: React.FC<
  UserSuggestedComponentsTableProps
> = ({
  data,
  moduleBomListItemId,
  moduleId,
  moduleName,
  bomItemDescription,
  userCurrency,
}) => {
  const [inventoryModalOpen, setInventoryModalOpen] = useState<string | undefined>();
  const [shoppingModalOpen, setShoppingModalOpen] = useState<string | undefined>();
  
  const columns: TableColumn<SuggestedComponent>[] = [
    {
      cell: (row) => (
        <div>
          {row.suggested_component.discontinued ? (
            <span>
              <s>{row.suggested_component.description}</s>{" "}
              <span className="italic font-bold text-red-500">
                DISCONTINUED
              </span>
            </span>
          ) : (
            <a
              className="text-blue-500 hover:text-blue-700"
              href={`/components/${row.suggested_component.id}`}
              rel="noreferrer"
              target="_blank"
            >
              {row.suggested_component.description || "N/A"}
            </a>
          )}
        </div>
      ),
      grow: 1,
      minWidth: "200px",
      name: "Description",
      sortable: true,
      wrap: true,
    },
    {
      name: "Type",
      selector: (row) => row.suggested_component.type.name || "Unknown",
      sortable: true,
      wrap: true,
    },
    {
      name: "Mounting Style",
      selector: (row) =>
        row.suggested_component.mounting_style === "smt"
          ? "Surface Mount"
          : row.suggested_component.mounting_style === "th"
          ? "Through Hole"
          : "N/A",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) =>
        (row.suggested_component.supplier_items?.length ?? 0) > 0 ? (
          <ul className="pl-5 list-disc">
            {(row.suggested_component.supplier_items ?? []).map(
              (item, index) => (
                <li key={index}>
                  <b>{item.supplier?.short_name || ""} </b>
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
                      className="text-blue-500 hover:text-blue-700"
                      href={item.link}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <LinkIcon className="inline-block w-4 h-4" />
                    </a>
                  )}
                  {item.price && (
                    <span className="text-xs text-gray-600">
                      {" "}
                      ({convertUnitPrice(item.price, userCurrency)})
                    </span>
                  )}
                </li>
              )
            )}
          </ul>
        ) : (
          "No supplier items"
        ),
      name: "Supplier Items",
      wrap: true,
    },
    {
      cell: (row) => (
        <Tippy
          content={
            <div
              dangerouslySetInnerHTML={{
                __html: getFaradConversions(
                  row.suggested_component.farads,
                  row.suggested_component.farads_unit
                ),
              }}
            />
          }
        >
          <span>
            {row.suggested_component.farads}{" "}
            {row.suggested_component.farads_unit}
          </span>
        </Tippy>
      ),
      name: "Farads",
      omit: data.every(
        (row) => row.suggested_component.type.name !== "Capacitor"
      ),
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => (
        <Tippy
          content={
            <div
              dangerouslySetInnerHTML={{
                __html: getOhmConversions(
                  row.suggested_component.ohms,
                  row.suggested_component.ohms_unit
                ),
              }}
            />
          }
        >
          <span>
            {row.suggested_component.ohms} {row.suggested_component.ohms_unit}
          </span>
        </Tippy>
      ),
      name: "Ohms",
      omit: data.every(
        (row) => row.suggested_component.type.name !== "Resistor"
      ),
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => (
        <Quantity
          hookArgs={{ component_pk: row.suggested_component.id }}
          useHook={useUserInventoryQuantity}
        />
      ),
      name: "Qty in User Inv.",
      sortable: false,
      width: "85px",
    },
    {
      cell: (row) => (
        <Quantity
          hookArgs={{
            component_pk: row.suggested_component.id,
            module_pk: moduleId,
            modulebomlistitem_pk: moduleBomListItemId,
          }}
          useHook={useGetUserShoppingListQuantity}
        />
      ),
      name: "Qty in Shopping List",
      sortable: false,
      width: "85px",
    },
    {
      cell: (row) => (
        <UserRating
          bomItemName={bomItemDescription}
          componentId={row.suggested_component.id}
          initialRating={0}
          moduleBomListItemId={moduleBomListItemId}
          moduleId={moduleId}
          moduleName={moduleName}
        />
      ),
      name: "User Rating",
      sortable: false,
      width: "90px",
    },
    {
      cell: () => (
        <Button
          Icon={FlagIcon}
          iconOnly
          size="xs"
          tooltipText="Report problem with component data"
          variant="link"
        >
          Report
        </Button>
      ),
      width: "70px",
    },
    {
      button: true,
      cell: (row) => (
        <>
          <Button
            onClick={() => setInventoryModalOpen(row.suggested_component.id)}
            size="xs"
            variant="primary"
          >
            + Inventory
          </Button>
          <AddComponentModal
            componentId={row.suggested_component.id}
            componentName={row.suggested_component.description}
            // @ts-ignore
            moduleId={moduleId}
            open={inventoryModalOpen === row.suggested_component.id}
            quantityRequired={row.quantity || 1}
            setOpen={setInventoryModalOpen}
            text={
              <>
                <span>
                  {`${moduleName} requires ${
                    row.quantity || 1
                  } x ${bomItemDescription}. How many `}
                </span>
                <span>
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    href={row.suggested_component?.link}
                  >
                    {row.suggested_component.description}
                  </a>
                </span>
                <span> would you like to add to your inventory?</span>
              </>
            }
            title={`Add ${row.suggested_component.description} to Inventory?`}
            type={Types.SHOPPING}
          />
        </>
      ),
      name: "",
      sortable: false,
      width: "95px",
    },
    {
      button: true,
      cell: (row) => (
        <>
          <Button
            onClick={() => setShoppingModalOpen(row.suggested_component.id)}
            size="xs"
            variant="primary"
          >
            + Shopping List
          </Button>
          <AddComponentModal
            componentId={row.suggested_component.id}
            componentName={row.suggested_component.description}
            // @ts-ignore
            moduleId={moduleId}
            open={shoppingModalOpen === row.suggested_component.id}
            quantityRequired={row.quantity || 1}
            setOpen={setShoppingModalOpen}
            text={
              <>
                <span>
                  {`${moduleName} requires ${
                    row.quantity || 1
                  } x ${bomItemDescription}. How many `}
                </span>
                <span>
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    href={row.suggested_component?.link}
                  >
                    {row.suggested_component.description}
                  </a>
                </span>
                <span> would you like to add to your shopping list?</span>
              </>
            }
            title={`Add ${row.suggested_component.description} to Shopping List?`}
            type={Types.INVENTORY}
          />
        </>
      ),
      name: "",
      sortable: false,
      width: "115px",
    },
  ];

  return (
    <div className="py-3">
      <Accordion
        backgroundColor="bg-gray-100"
        borderColor="border border-gray-300"
        infoIcon
        innerPadding="p-4"
        isOpenByDefault={false}
        notice="User-submitted components are hidden by default until they are reviewed by our team."
        rounded
        title={`${data.length} user-submitted option${data.length !== 1 ? "s" : ""} ${data.length !== 1 ? "is" : "are"} hidden.`}
      > 
        <DataTable
          columns={columns}
          customStyles={customStyles}
          data={data || []}
          progressPending={!data}
        />
      </Accordion>
    </div>
  );
};

export default UserSuggestedComponentsTable;
