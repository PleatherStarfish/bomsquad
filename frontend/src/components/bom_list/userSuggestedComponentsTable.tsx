import React from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import Tippy from "@tippyjs/react";
import { FlagIcon, LinkIcon } from "@heroicons/react/24/outline";
import { SuggestedComponent } from "../../services/useGetSuggestedComponentsList";
import { customStyles } from "./NestedTable";
import { getFaradConversions, getOhmConversions } from "../conversions";
import convertUnitPrice from "../../utils/convertUnitPrice";
import Quantity from "./quantity";
import useUserInventoryQuantity from "../../services/useGetUserInventoryQuantity";
import useGetUserShoppingListQuantity from "../../services/useGetUserShoppingListQuantity";
import UserRating from "./UserRating";
import Button from "../../ui/Button";
import Accordion from "../../ui/Accordion";

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
                  <b>{item.supplier?.short_name || ""}: </b>
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
  ];

  return (
    <div className="py-3">
      <Accordion
        bgColor="bg-gray-100"
        headerClasses="font-bold text-lg"
        innerPadding="p-4"
        rounded
        title="User Suggested Components"
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
