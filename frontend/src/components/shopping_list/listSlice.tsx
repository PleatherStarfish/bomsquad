import {
  GroupedByModule,
  UserShoppingList
} from "../../types/shoppingList";
import { AggregatedComponent } from "../../types/shoppingList"
import {
  ArrowPathIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import getCurrencySymbol, { roundToCurrency } from "../../utils/currencies";

import AddOneModal from "./addOneModal";
import Button from "../../ui/Button";
import DataTable, { TableColumn } from "react-data-table-component";
import { Helmet } from "react-helmet";
import Modal from "../../ui/Modal";
import NumericInput from "react-numeric-input";
import cx from "classnames";
import { get, find } from "lodash";
import useDeleteShoppingListItem from "../../services/useDeleteModuleFromShoppingList";
import useUpdateShoppingList from "../../services/useUpdateShoppingList";
import TotalPriceForComponent from "./TotalPriceForComponent"
import Quantity from "./Quantity"
import TotalQuantity from "./TotalQuantity"
import ListPriceSum from "./ListPriceSum"

interface ListSliceProps {
  name: string;
  index: number;
  slug?: string;
  moduleId?: string;
  allModulesData: GroupedByModule[];
  componentsInModule: Record<string, UserShoppingList[]> | [];
  aggregatedComponents: UserShoppingList[];
  componentsAreLoading: boolean;
  hideInteraction?: boolean;
  backgroundColor?: string;
  displayTotals?: boolean;
}

type AggregatedRow = UserShoppingList & { placeholder: true };

type GetColumnsBasedOnIndex = (
  index: number,
  allModulesData: { length: number }
) => TableColumn<AggregatedRow>[];

const ListSlice: React.FC<ListSliceProps> = ({
  name,
  index,
  slug,
  moduleId,
  allModulesData,
  componentsInModule,
  aggregatedComponents,
  componentsAreLoading,
  hideInteraction = false,
  backgroundColor = "bg-white",
  displayTotals = true
}) => {
  const [quantityIdToEdit, setQuantityIdToEdit] = useState<string | undefined>();
const [updatedQuantityToSubmit, setUpdatedQuantityToSubmit] = useState<number | undefined>();
const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
const [deleteModalModuleDetails, setDeleteModalModuleDetails] = useState<{
  moduleId?: string;
  moduleName: string;
} | undefined>();
const [addOneToInventoryModalOpen, setAddOneToInventoryModalOpen] = useState<UserShoppingList | null>(null);
  
  const updateShoppingListMutate = useUpdateShoppingList();
  const deleteMutation = useDeleteShoppingListItem();

  const bgStyles = `
    .rdt_TableHeadRow { background-color: ${backgroundColor}; }
    .rdt_TableRow { background-color: ${backgroundColor}; }
    .rdt_Pagination { background-color: ${backgroundColor}; }
  `;

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      setDeleteModalOpen(false);
      setDeleteModalModuleDetails(undefined);
    } else if (deleteMutation.isError) {
      setDeleteModalOpen(false);
    }
  }, [deleteMutation.isSuccess, deleteMutation.isError]);

  const handleQuantityChange = (value: number | null) => {
    if (value !== null) {
      setUpdatedQuantityToSubmit(value);
    }
  };

  const handleSubmitQuantity = (componentId: string, moduleId?: string) => {
    const quantity = updatedQuantityToSubmit;
    const moduleData = find(allModulesData, { moduleId });
  
    if (!moduleData || !moduleData.data[componentId]) {
      console.error(`Module data or component data not found for componentId: ${componentId}`);
      return;
    }
  
    const modulebomlistitem = moduleData.data[componentId][0]?.bom_item;
    console.log(moduleData.data[componentId][0])
  
    const data = {
      module_pk: moduleId ?? undefined,
      modulebomlistitem_pk: modulebomlistitem,
      quantity,
    };
  
    updateShoppingListMutate({ componentPk: componentId, ...data });
    setQuantityIdToEdit(undefined);
    setUpdatedQuantityToSubmit(undefined);
  };

  const labelColumns: TableColumn<AggregatedRow>[] = [
    {
      cell: (row) => (
        <span
          className={cx({
            "text-black": index !== 0,
            "text-gray-300": index === 0,
          })}
        >
          {row.component.description}
        </span>
      ),
      name: <div className="font-bold text-gray-400">Description</div>,
      sortable: false,
      wrap: false,
    },
    {
      cell: (row) => (
        <span
          className={cx({
            "text-black": index !== 0,
            "text-gray-300": index === 0,
          })}
        >
          {row.component?.supplier?.short_name}
        </span>
      ),
      name: <div className="font-bold text-gray-400">Supplier</div>,
      sortable: false,
      wrap: false,
    },
    {
      cell: (row) => (
        <a
          className={cx({
            "text-blue-400 hover:text-blue-600": index === 0,
            "text-blue-500 hover:text-blue-700": index !== 0,
          })}
          href={row.component.link}
        >
          {row.component?.supplier_item_no ? row.component?.supplier_item_no : "[ none ]"}
        </a>
      ),
      name: <div className="font-bold text-gray-400">Supp. Item #</div>,
      sortable: false,
      wrap: false,
    },
    {
      cell: (row) => {
        return (
          <span className="text-gray-300">{`${getCurrencySymbol(
            row.component.price?.currency
          )}${roundToCurrency(
            row.component.unit_price,
            row.component.price?.currency
          )}`}</span>
        );
      },
      name: <div className="font-bold text-gray-400">Price</div>,
    }
  ];

  const normalizedComponentsInModule: Record<string, AggregatedComponent[]> | undefined =
  componentsInModule && !Array.isArray(componentsInModule)
    ? Object.fromEntries(
        Object.entries(componentsInModule).map(([key, value]) => [
          key,
          value.map((item) => ({
            bom_item: item.bom_item,
            component: item.component, 
            datetime_created: item.datetime_created,
            datetime_updated: item.datetime_updated,
            id: item.id,
            module: item.module?.name || null,
            module_name: item.module_name,
            quantity: item.quantity,
            user: item.user,
          })),
        ])
      )
    : undefined;

  const qtyColumns: TableColumn<AggregatedRow>[] = [
    {
      cell: (row) => {
        const compsForModuleThatMatchRow = get(
          componentsInModule,
          row.component.id,
          []
        );
        const totalQuantity = compsForModuleThatMatchRow.reduce(
          (acc, obj) => acc + obj.quantity,
          0
        );
        return (
          <div className="flex content-center justify-between w-full">
            {row.component.id === quantityIdToEdit ? (
              <div>
                <form
                  className="flex content-center w-full gap-1"
                  onSubmit={(e) => e.preventDefault()}
                >
                  <NumericInput
                    className="block w-16 rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
                    onChange={(e) => handleQuantityChange(e)}
                    type="number"
                    value={updatedQuantityToSubmit ?? totalQuantity}
                  />
                  <div className="flex justify-around gap-1">
                    <Button
                      classNames="h-full"
                      Icon={XMarkIcon}
                      iconOnly
                      onClick={() => {
                        setQuantityIdToEdit(undefined);
                        setUpdatedQuantityToSubmit(undefined);
                      }}
                      size="xs"
                      variant="muted"
                    >
                      Close
                    </Button>
                    <Button
                      classNames="h-full"
                      Icon={ArrowPathIcon}
                      iconOnly
                      onClick={() => {
                        handleSubmitQuantity(row.component.id, moduleId);
                      }}
                      size="xs"
                      variant="primary"
                    >
                      Update
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <Quantity
                componentId={row.component.id}
                componentsInModule={normalizedComponentsInModule}
                hideInteraction={hideInteraction}
                pencilComponent={
                  row.component.id !== quantityIdToEdit && (
                    <div
                      onClick={() => {
                        setQuantityIdToEdit(row.component.id);
                        setUpdatedQuantityToSubmit(totalQuantity);
                      }}
                      role="button"
                    >
                      <PencilSquareIcon className="w-4 h-4 stroke-slate-300 hover:stroke-pink-500" />
                    </div>
                  )
                }
              />
            )}
          </div>
        );
      },
      name: slug ? (
        <div className="flex flex-col gap-2 cursor-pointer">
          <span className="group-hover/column:hidden">
            <a
              className="text-blue-500 hover:text-blue-700"
              href={`/module/${slug}/`}
            >
              {name}
            </a>
          </span>
          {!hideInteraction && (
            <Button
              classNames="hidden group-hover/column:inline-flex w-fit pb-2 transition-opacity duration-300 opacity-0 group-hover/column:opacity-100"
              onClick={() => {
                setDeleteModalModuleDetails({
                  moduleId: moduleId,
                  moduleName: name,
                });
                setDeleteModalOpen(true);
              }}
              size="xs"
              variant="danger"
            >
              Delete
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 cursor-pointer">
          <span className="text-bold group-hover/column:hidden">{name === "null" ? "Other" : name}</span>
          {!hideInteraction && (
            <Button
              classNames="hidden group-hover/column:inline-flex w-fit pb-2 transition-opacity duration-300 opacity-0 group-hover/column:opacity-100"
              onClick={() => {
                setDeleteModalModuleDetails({
                  moduleId: undefined,
                  moduleName: "undefined modules",
                });
                setDeleteModalOpen(true);
              }}
              size="xs"
              variant="danger"
            >
              Delete
            </Button>
          )}
        </div>
      ),
      sortable: false,
      width: quantityIdToEdit ? "200px" : "100px",
    },
  ];

  const totalColumn: TableColumn<AggregatedRow>[] = [
    {
      cell: (row) => {
        return !row?.placeholder ? (
          <TotalQuantity
            componentId={row?.component?.id}
            // setIdToTotalQuantityLookup={setIdToTotalQuantityLookup}
          />
        ) : (
          <span className="text-lg font-bold">TOTAL:</span>
        );
      },
      name: <div className="text-bold">TOTAL QUANTITY</div>,
      sortable: false,
      style: { backgroundColor: "#f0f9ff" },
      width: "100px",
    },
  ];

  const priceColumn = [
    {
      cell: (row) => {
        return !row?.placeholder ? (
          <TotalPriceForComponent
            componentId={row?.component?.id}
            currency={row?.component?.price_currency}
          />
        ) : (
          <ListPriceSum currency="USD" />
        );
      },
      name: <div className="text-bold">TOTAL PRICE</div>,
      sortable: false,
      style: { backgroundColor: "#f0f9ff" },
      width: "100px",
    },
  ];

  const stateColumn: TableColumn<AggregatedRow>[] = [
    {
      cell: (row) => {
        return (!row?.placeholder ? <Button Icon={PlusIcon} iconOnly onClick={() => setAddOneToInventoryModalOpen(row)} size="xs" tooltipText={"Add to inventory"} variant="primary" /> : undefined);
      },
      name: <></>,
      sortable: false,
      width: "50px",
    },
  ];

  const getColumnsBasedOnIndex: GetColumnsBasedOnIndex = (index, allModulesData) => {
    switch (index) {
      case 0:
        return labelColumns as TableColumn<AggregatedRow>[];
  
      case allModulesData.length + 1:
        return totalColumn as TableColumn<AggregatedRow>[];
  
      case allModulesData.length + 2:
        return priceColumn as TableColumn<AggregatedRow>[];
  
      case allModulesData.length + 3:
        return stateColumn as TableColumn<AggregatedRow>[];
  
      default:
        return qtyColumns as TableColumn<AggregatedRow>[];
    }
  };

  const getColumnsBasedOnIndexHideTotals = (index) => {
    switch (index) {
      case 0:
        return labelColumns;
        
      default:
        return qtyColumns;
    }
  }

  const tableRowsNoLines = [
    {
      classNames: ["!border-0"],
      when: () => true,
    },
  ];

  let widthClass;

  if (index === 0) {
      widthClass = "w-full grow";
  } else if (quantityIdToEdit) {
      widthClass = "w-[200px]";
  } else {
      widthClass = "w-[100px]";
  }

  return (
    <>
      <Helmet>
        <style>{backgroundColor != "bg-white" ? bgStyles : ""}</style>
      </Helmet>
      <div
        className={cx("group/column", widthClass)}
      >
        <div className={cx({ "border-r border-gray-300": index === 0 })} id={(index == allModulesData.length + 3) ? "shopping-list-slice-state-table" : undefined}>
          <DataTable
            // @ts-ignore
            columns={displayTotals 
              ? getColumnsBasedOnIndex(index, allModulesData) 
              : getColumnsBasedOnIndexHideTotals(index)
            }
            compact
            conditionalRowStyles={index == allModulesData.length + 3 ? tableRowsNoLines : undefined}
            data={
              !(index > allModulesData.length)
                ? aggregatedComponents
                : [...aggregatedComponents, { placeholder: true }]
            }
            noHeader
            progressComponent={
              <div className="flex justify-center w-full p-6 bg-sky-50">
                <div className="text-center text-gray-500 animate-pulse">
                  Loading...
                </div>
              </div>
            }
            progressPending={componentsAreLoading}
            responsive
          />
        </div>
      </div>
      <Modal
        onSubmit={() =>
          deleteMutation.mutate({
            module_pk: deleteModalModuleDetails?.moduleId,
          })
        }
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        submitButtonText={"Delete"}
        title={`Delete components for ${deleteModalModuleDetails?.moduleName}?`}
      >
        {`Are you sure you want to delete all the components in your shopping list for ${deleteModalModuleDetails?.moduleName}?`}
      </Modal>
      <AddOneModal
        component={addOneToInventoryModalOpen}
        setComponent={setAddOneToInventoryModalOpen}
      />
    </>
  );
};

export default ListSlice;