import DataTable from "react-data-table-component";
import React from "react";
import cx from "classnames";
import { get } from "lodash";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity";

const Quantity = ({ componentId, componentsInModule }) => {
  const compsForModuleThatMatchRow = get(componentsInModule, componentId, []);
  const totalQuantity = compsForModuleThatMatchRow.reduce(
    (acc, obj) => acc + obj.quantity,
    0
  );
  return totalQuantity ? (
    <span className="font-bold">{totalQuantity}</span>
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
  allModulesData,
  componentsInModule,
  aggregatedComponents,
  componentsAreLoading,
}) => {
  const labelColumns = [
    {
      name: <div className="text-gray-400 font-bold">Description</div>,
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
      name: <div className="text-gray-400 font-bold">Supplier</div>,
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
      name: <div className="text-gray-400 font-bold">Supp. Item #</div>,
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
      name: (
        <div className="text-bold">
          {name === "null" ? "Module not specif." : `${name} qty.`}
        </div>
      ),
      selector: (row) => (
        <Quantity
          componentId={row.component.id}
          componentsInModule={componentsInModule}
        />
      ),
      sortable: false,
      width: "100px",
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

  return (
    <div className={cx({ "w-[450px]": index === 0, "w-[100px]": index !== 0 })}>
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
            <div className="flex justify-center w-full bg-sky-50 p-6">
              <div className="text-gray-500 animate-pulse">Loading...</div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ListSlice;
