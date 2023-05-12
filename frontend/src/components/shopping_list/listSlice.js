import {
  ArrowPathIcon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useState } from "react";

import Button from "../../ui/Button";
import DataTable from "react-data-table-component";
import NumericInput from "react-numeric-input";
import cx from "classnames";
import { get } from "lodash";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity";

const Quantity = ({ componentId, componentsInModule, pencilComponent }) => {
  const compsForModuleThatMatchRow = get(componentsInModule, componentId, []);
  const totalQuantity = compsForModuleThatMatchRow.reduce(
    (acc, obj) => acc + obj.quantity,
    0
  );
  return totalQuantity ? (
    <>
      <span className="font-bold">{totalQuantity}</span>
      {pencilComponent}
    </>
  ) : undefined;
};

const TotalQuantity = ({ componentId }) => {
  const { data: quantityInInventoryAnon } =
    useGetUserAnonymousShoppingListQuantity(componentId);

  return quantityInInventoryAnon ? (
    <span className="font-bold">{quantityInInventoryAnon}</span>
  ) : undefined;
};

const ListSlice = ({
  name,
  index,
  slug,
  allModulesData,
  componentsInModule,
  aggregatedComponents,
  componentsAreLoading,
}) => {
  const [quantityIdToEdit, setQuantityIdToEdit] = useState();
  const [updatedQuantityToSubmit, setUpdatedQuantityToSubmit] = useState();

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
      width: "200px",
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
      width: "100px",
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
      width: "150px",
    },
  ];

  const qtyColumns = [
    {
      name: slug ? (
        <div className="text-bold">
          {name === "null" ? (
            "Other"
          ) : (
            <span>
              <a
                href={`/module/${slug}`}
                className="text-blue-500 hover:text-blue-700"
              >
                {name}
              </a>
            </span>
          )}
        </div>
      ) : (
        <div className="text-bold">{name === "null" ? "Other" : name}</div>
      ),
      cell: (row) => {
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
                    value={updatedQuantityToSubmit ?? row.quantity}
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
                      onClick={() => handleSubmitQuantity(row.component.id)}
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
                pencilComponent={
                  row.component.id !== quantityIdToEdit && (
                    <div
                      onClick={() =>
                        handleClick(
                          row,
                          "quantity",
                          quantityIdToEdit,
                          setQuantityIdToEdit,
                          setUpdatedQuantityToSubmit
                        )
                      }
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
      width: quantityIdToEdit ? "165px" : "100px",
    },
  ];

  const totalColumn = [
    {
      name: <div className="text-bold">TOTAL</div>,
      selector: (row) => (
        <TotalQuantity
          componentId={row.component.id}
          componentsInModule={componentsInModule}
          allModulesData={allModulesData}
        />
      ),
      sortable: false,
      width: "100px",
      style: { backgroundColor: "#f0f9ff" },
    },
  ];

  const handleClick = (
    row,
    field,
    fieldIdToEdit,
    setFieldIdToEdit,
    setUpdatedFieldToSubmit
  ) => {
    const { component, [field]: fieldValue } = row;
    if (component.id !== fieldIdToEdit) {
      setFieldIdToEdit(component.id);
      setUpdatedFieldToSubmit(fieldValue);
    } else {
      setFieldIdToEdit(undefined);
    }
  };

  return (
    <div
      className={cx({
        "w-[450px]": index === 0,
        "w-[100px]": index !== 0 && !quantityIdToEdit,
        "w-[165px]": index !== 0 && quantityIdToEdit,
      })}
    >
      <div className={cx({ "border-r border-gray-300": index === 0 })}>
        <DataTable
          compact
          responsive
          noHeader
          columns={
            index === 0
              ? labelColumns
              : index === allModulesData.length + 1
              ? totalColumn
              : qtyColumns
          }
          data={aggregatedComponents}
          progressPending={componentsAreLoading}
          progressComponent={
            <div className="flex justify-center w-full p-6 bg-sky-50">
              <div className="text-center text-gray-500 animate-pulse">Loading...</div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ListSlice;
