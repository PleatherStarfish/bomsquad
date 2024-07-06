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
import DataTable from "react-data-table-component";
import { Helmet } from "react-helmet";
import Modal from "../../ui/Modal";
import NumericInput from "react-numeric-input";
import cx from "classnames";
import { get } from "lodash";
import useDeleteShoppingListItem from "../../services/useDeleteModuleFromShoppingList";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity";
import useGetUserShoppingListComponentTotalPrice from "../../services/useGetUserShoppingListComponentTotalPrice";
import useGetUserShoppingListTotalPrice from "../../services/useGetUserShoppingListTotalPrice";
import useUpdateShoppingList from "../../services/useUpdateShoppingList";
import { useWindowWidth } from "@react-hook/window-size";

const Quantity = ({
  componentId,
  componentsInModule,
  pencilComponent,
  hideInteraction,
}) => {
  const compsForModuleThatMatchRow = get(componentsInModule, componentId, []);
  const totalQuantity = compsForModuleThatMatchRow.reduce(
    (acc, obj) => acc + obj.quantity,
    0
  );
  return totalQuantity ? (
    <>
      <span className="font-bold">{totalQuantity}</span>
      {hideInteraction || pencilComponent}
    </>
  ) : undefined;
};

const TotalQuantity = ({ componentId }) => {
  const { data: quantityInInventoryAnon } =
    useGetUserAnonymousShoppingListQuantity(componentId);

  // Cache the total quantity for this component in a lookup table
  // useEffect(() => {
  //   setIdToTotalQuantityLookup((prevState) => ({
  //     ...prevState,
  //     [componentId]: quantityInInventoryAnon,
  //   }));
  // }, [quantityInInventoryAnon]);

  return quantityInInventoryAnon ? (
    <span className="font-bold">{quantityInInventoryAnon}</span>
  ) : undefined;
};

const TotalPriceForComponent = ({ componentId, currency }) => {
  const { totalPrice, totalPriceIsLoading, totalPriceIsError } =
    useGetUserShoppingListComponentTotalPrice(componentId);

  if (totalPriceIsError) {
    return <div>Error fetching data</div>;
  }

  if (totalPriceIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  return (
    <span className="font-bold">{`${getCurrencySymbol(
      currency
    )}${roundToCurrency(totalPrice, currency)}`}</span>
  );
};

const ListPriceSum = ({ currency }) => {
  const { totalPrice, totalPriceIsLoading, totalPriceIsError } =
    useGetUserShoppingListTotalPrice();

  if (totalPriceIsError) {
    return <div>Error fetching data</div>;
  }

  if (totalPriceIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  return (
    <span className="font-bold">{`${getCurrencySymbol(
      currency
    )}${roundToCurrency(totalPrice, currency)}`}</span>
  );
};

const ListSlice = ({
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
  const [quantityIdToEdit, setQuantityIdToEdit] = useState();
  const [updatedQuantityToSubmit, setUpdatedQuantityToSubmit] = useState();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModalModuleDetails, setDeleteModalModuleDetails] = useState();
  // const [idToTotalQuantityLookup, setIdToTotalQuantityLookup] = useState({});
  const [addOneToInventoryModalOpen, setAddOneToInventoryModalOpen] = useState(false);
  
  const onlyWidth = useWindowWidth();

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

  const handleQuantityChange = (e) => {
    setUpdatedQuantityToSubmit(e);
  };

  const handleSubmitQuantity = (componentId, moduleId) => {
    const quantity = updatedQuantityToSubmit;
    const modulebomlistitem = _.find(allModulesData, { moduleId: moduleId })
      .data[componentId][0].bom_item;
    const data = {
      quantity,
      modulebomlistitem_pk: modulebomlistitem,
      module_pk: moduleId ?? undefined,
    };
    updateShoppingListMutate({ componentPk: componentId, ...data });
    setQuantityIdToEdit(undefined);
    setUpdatedQuantityToSubmit(undefined);
  };

  const labelColumns = [
    {
      name: <div className="font-bold text-gray-400">Description</div>,
      selector: (row) => (
        <span
          className={cx({
            "text-gray-300": index === 0,
            "text-black": index !== 0,
          })}
        >
          {row.component.description}
        </span>
      ),
      sortable: false,
      wrap: false,
    },
    {
      name: <div className="font-bold text-gray-400">Supplier</div>,
      selector: (row) => (
        <span
          className={cx({
            "text-gray-300": index === 0,
            "text-black": index !== 0,
          })}
        >
          {row.component?.supplier?.short_name}
        </span>
      ),
      sortable: false,
      wrap: false,
    },
    {
      name: <div className="font-bold text-gray-400">Supp. Item #</div>,
      selector: (row) => (
        <a
          href={row.component.link}
          className={cx({
            "text-blue-400 hover:text-blue-600": index === 0,
            "text-blue-500 hover:text-blue-700": index !== 0,
          })}
        >
          {row.component.supplier_item_no}
        </a>
      ),
      sortable: false,
      wrap: false,
    },
    {
      name: <div className="font-bold text-gray-400">Price</div>,
      selector: (row) => {
        return (
          <span className="text-gray-300">{`${getCurrencySymbol(
            row.component.price_currency
          )}${roundToCurrency(
            row.component.price,
            row.component.price_currency
          )}`}</span>
        );
      },
    }
  ];

  const qtyColumns = [
    {
      name: slug ? (
        <div className="flex flex-col gap-2 cursor-pointer">
          <span className="group-hover/column:hidden">
            <a
              href={`/module/${slug}/`}
              className="text-blue-500 hover:text-blue-700"
            >
              {name}
            </a>
          </span>
          {!hideInteraction && (
            <Button
              classNames="hidden group-hover/column:inline-flex w-fit pb-2 transition-opacity duration-300 opacity-0 group-hover/column:opacity-100"
              variant="danger"
              size="xs"
              onClick={() => {
                setDeleteModalModuleDetails({
                  moduleName: name,
                  moduleId: moduleId,
                });
                setDeleteModalOpen(true);
              }}
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
              variant="danger"
              size="xs"
              onClick={() => {
                setDeleteModalModuleDetails({
                  moduleName: "undefined modules",
                  moduleId: undefined,
                });
                setDeleteModalOpen(true);
              }}
            >
              Delete
            </Button>
          )}
        </div>
      ),
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
                    type="number"
                    value={updatedQuantityToSubmit ?? totalQuantity}
                    onChange={(e) => handleQuantityChange(e)}
                  />
                  <div className="flex justify-around gap-1">
                    <Button
                      className="h-full"
                      variant="muted"
                      size="xs"
                      iconOnly
                      Icon={XMarkIcon}
                      onClick={() => {
                        setQuantityIdToEdit(undefined);
                        setUpdatedQuantityToSubmit(undefined);
                      }}
                    >
                      Close
                    </Button>
                    <Button
                      className="h-full"
                      variant="primary"
                      size="xs"
                      iconOnly
                      Icon={ArrowPathIcon}
                      onClick={() => {
                        handleSubmitQuantity(row.component.id, moduleId);
                      }}
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
      width: "100px",
      style: { backgroundColor: "#f0f9ff" },
    },
  ];

  const priceColumn = [
    {
      name: <div className="text-bold">TOTAL PRICE</div>,
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
      sortable: false,
      width: "100px",
      style: { backgroundColor: "#f0f9ff" },
    },
  ];

  const stateColumn = [
    {
      name: <></>,
      cell: (row) => {
        return (!row?.placeholder ? <Button size="xs" variant="primary" Icon={PlusIcon} iconOnly tooltipText={"Add to inventory"} onClick={() => setAddOneToInventoryModalOpen(row?.component)} /> : undefined);
      },
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
      when: (row) => true,
      classNames: ["!border-0"],
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
        <div id={(index == allModulesData.length + 3) ? "shopping-list-slice-state-table" : undefined} className={cx({ "border-r border-gray-300": index === 0 })}>
          <DataTable
            compact
            responsive
            noHeader
            columns={displayTotals 
              ? getColumnsBasedOnIndex(index, allModulesData) 
              : getColumnsBasedOnIndexHideTotals(index)
            }
            data={
              !(index > allModulesData.length)
                ? aggregatedComponents
                : [...aggregatedComponents, { placeholder: true }]
            }
            conditionalRowStyles={index == allModulesData.length + 3 ? tableRowsNoLines : undefined}
            progressPending={componentsAreLoading}
            progressComponent={
              <div className="flex justify-center w-full p-6 bg-sky-50">
                <div className="text-center text-gray-500 animate-pulse">
                  Loading...
                </div>
              </div>
            }
          />
        </div>
      </div>
      <Modal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        title={`Delete components for ${deleteModalModuleDetails?.moduleName}?`}
        submitButtonText={"Delete"}
        onSubmit={() =>
          deleteMutation.mutate({
            module_pk: deleteModalModuleDetails?.moduleId,
          })
        }
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
