import {
  AggregatedComponent,
  GroupedByModule,
} from "../../types/shoppingList";
import {
  ArrowPathIcon,
  LinkIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import DataTable, { TableColumn } from "react-data-table-component";
import React, { useEffect, useState } from "react";

import AddOneModal from "./addOneModal";
import Button from "../../ui/Button";
import { Helmet } from "react-helmet";
import ListPriceSum from "./ListPriceSum"
import Modal from "../../ui/Modal";
import NumericInput from "react-numeric-input";
import Quantity from "./Quantity";
import TotalPriceForComponent from "./TotalPriceForComponent"
import TotalQuantity from "./TotalQuantity";
import convertUnitPrice from "../../utils/convertUnitPrice"
import cx from "classnames";
import { get } from "lodash";
import useDeleteModuleFromShoppingList from "../../services/useDeleteModuleFromShoppingList";
import useGetUserCurrency from "../../services/useGetUserCurrency"
import useUpdateShoppingList from "../../services/useUpdateShoppingList";

interface ListSliceProps {
  name: string;
  index: number;
  slug?: string;
  moduleId?: string;
  allModulesData: GroupedByModule[];
  componentsInModule: Record<string, AggregatedComponent[]>;
  aggregatedComponents: AggregatedComponent[];
  componentsAreLoading: boolean;
  hideInteraction?: boolean;
  backgroundColor?: string;
  displayTotals?: boolean;
}

const getBaseUrl = () => {
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

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
  } | null>(null);
  const [addOneToInventoryModalOpen, setAddOneToInventoryModalOpen] = useState<AggregatedComponent | null>(null);
  
  const updateShoppingListMutate = useUpdateShoppingList();
  const deleteMutation = useDeleteModuleFromShoppingList();
  const { data: currencyData } = useGetUserCurrency();

  const bgStyles = `
  .rdt_TableHeadRow { background-color: ${backgroundColor}; }
  .rdt_TableRow { background-color: ${backgroundColor}; }
  .rdt_Pagination { background-color: ${backgroundColor}; }
`;

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      setDeleteModalOpen(false);
      setDeleteModalModuleDetails(null);
    } else if (deleteMutation.isError) {
      setDeleteModalOpen(false);
    }
  }, [deleteMutation.isSuccess, deleteMutation.isError]);

  const handleQuantityChange = (value: number) => {
    setUpdatedQuantityToSubmit(value);
  };

  const handleSubmitQuantity = (componentId: string, moduleId?: string) => {
    const quantity = updatedQuantityToSubmit;
    const moduleBomListItem = get(
      allModulesData.find((module) => module.moduleId === moduleId),
      `data.${componentId}[0].bom_item`
    );
    const data = {
      module_pk: moduleId,
      modulebomlistitem_pk: moduleBomListItem,
      quantity,
    };
    updateShoppingListMutate({ componentPk: componentId, ...data });
    setQuantityIdToEdit(undefined);
    setUpdatedQuantityToSubmit(undefined);
  };

  const labelColumns: TableColumn<AggregatedComponent>[] = [
    {
      cell: (row) => (
        <div
          className={cx("h-[47px] overflow-scroll", {
            "text-black": index !== 0,
            "text-gray-300": index === 0,
          })}
        >
          <a className="text-blue-500 hover:text-blue-700" href={`${getBaseUrl()}/components/${row.component.id}`}>{row.component.description}</a>
        </div>
      ),
      name: <div className="font-bold text-gray-400">Description</div>,
      sortable: false,
      wrap: false,
    },
    {
      cell: (row) =>
        (row.component.supplier_items || []).length > 0 ? (
          <ul className="pl-5 list-disc h-[47px] overflow-scroll">
            {row.component.supplier_items?.map((item) => (
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
      name: "Suppliers",
      sortable: false,
    }
  ];

  const qtyColumns = [
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
                componentsInModule={componentsInModule}
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

  const totalColumn = [
    {
      name: <div className="text-bold">TOTAL QUANTITY</div>,
      selector: (row) => {
        return !row?.placeholder ? (
          <TotalQuantity
            componentId={row?.component?.id}
            // setIdToTotalQuantityLookup={setIdToTotalQuantityLookup}
          />
        ) : (
          <span className="text-lg font-bold">TOTAL:</span>
        );
      },
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
          />
        ) : (
          <ListPriceSum currency="USD" />
        );
      },
      name: <div className="text-bold">TOTAL PRICE</div>,
      sortable: false,
      style: { backgroundColor: "#f0f9ff" },
      width: "140px",
    },
  ];

  const stateColumn = [
    {
      cell: (row) => {
        return (!row?.placeholder ? <Button Icon={PlusIcon} iconOnly onClick={() => setAddOneToInventoryModalOpen(row?.component)} size="xs" tooltipText={"Add to inventory"} variant="primary" /> : undefined);
      },
      name: <></>,
      sortable: false,
      width: "50px",
    },
  ];

  const getColumnsBasedOnIndex = (index, allModulesData) => {
    switch (index) {
      case 0:
        return labelColumns;
        
      case allModulesData.length + 1:
        return totalColumn;
        
      case allModulesData.length + 2:
        return priceColumn;

        case allModulesData.length + 3:
          return stateColumn;
        
      default:
        return qtyColumns;
    }
  }

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
      widthClass = "w-[140px]";
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
            columns={
              displayTotals
                ? (getColumnsBasedOnIndex(index, allModulesData) as TableColumn<AggregatedComponent | { placeholder: boolean }>[] )
                : (getColumnsBasedOnIndexHideTotals(index) as TableColumn<AggregatedComponent | { placeholder: boolean }>[] )
            }
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