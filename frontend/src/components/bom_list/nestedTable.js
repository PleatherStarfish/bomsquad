import React from "react";
import DataTable from "react-data-table-component";
import useGetComponents from "../../services/useGetComponents";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import { BagCheck, BoxSeam } from 'react-bootstrap-icons';
import Button from "../../ui/Button";
import InventoryQuantity from "./invQty";

export const customStyles = {
  headCells: {
    style: {
      padding: "0 0.5rem 0 0.5rem",
      fontWeight: "bold",
      backgroundColor: "rgb(249 250 251)",
    },
  },
  rows: {
    style: {
      backgroundColor: "rgb(249 250 251)",
      padding: "0.2rem 0 0.2rem 0",
    },
  },
  cells: {
    style: {
      padding: "0 0.5rem 0 0.5rem",
    },
  },
};

const NestedTable = (props) => {
  const { user } = useAuthenticatedUser();
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponents(props.data.components_options);

  if (componentsAreError) {
    return (
      <div className="p-3 ml-[47px] bg-gray-100">
        Error loading components: {componentsAreError.message}
      </div>
    );
  }

  const columns = [
    {
      name: "Name",
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
    },
    // {
    //   name: "Type",
    //   selector: (row) => row.type?.name,
    //   sortable: true,
    //   wrap: true,
    //   hide: "md"
    // },
    // {
    //   name: "Manufacturer",
    //   selector: (row) => row.manufacturer?.name,
    //   sortable: true,
    //   wrap: true,
    //   hide: "lg"
    // },
    {
      name: "Supplier",
      selector: (row) => row.supplier?.name,
      sortable: true,
      wrap: true,
    },
    {
      name: "Supplier Item #",
      selector: (row) => <a href={row.link}>{row.supplier_item_no}</a>,
      sortable: true,
      wrap: true,
    },
    {
      name: "Farads",
      selector: (row) => row.farads,
      sortable: true,
      wrap: true,
      omit: props.data.type !== "Capacitor",
    },
    {
      name: "Ohms",
      selector: (row) => row.ohms,
      sortable: true,
      wrap: true,
      omit: props.data.type !== "Resistor",
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
      wrap: true,
      hide: "md",
    },
    // {
    //   name: "Tolerance",
    //   selector: (row) => row.tolerance,
    //   sortable: true,
    //   wrap: true,
    //   hide: "md"
    // },
    // {
    //   name: "Voltage Rating",
    //   selector: (row) => row.voltage_rating,
    //   sortable: true,
    //   wrap: true,
    //   hide: "md"
    // },
    {
      name: "Qty in User Inv.",
      cell: (row) => <InventoryQuantity componentPk={row.id} />,
      sortable: false,
      omit: !user,
    },
    {
      name: "Qty in Shopping List",
      selector: (row) => row.voltage_rating,
      sortable: false,
      omit: !user,
    },
    {
      name: "",
      cell: () => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => console.log("clicked")}
          Icon={BagCheck}
          iconOnly={true}
          tooltipText="Add to Shopping List"
        />
      ),
      button: true,
      sortable: false,
      omit: !user,
      ignoreRowClick: true,
      width: "44px",
    },
    {
      name: "",
      cell: () => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => console.log("clicked")}
          Icon={BoxSeam}
          iconOnly={true}
          tooltipText="Add to Inventory"
        />
      ),
      button: true,
      sortable: false,
      omit: !user,
      ignoreRowClick: true,
      width: "44px",
    },
  ];

  return (
    <div className="py-1 px-3 ml-[47px] bg-gray-50">
      <DataTable
        compact
        fixedHeader
        responsive
        subHeaderAlign="right"
        subHeaderWrap
        exportHeaders
        columns={columns}
        data={componentsData}
        progressPending={componentsAreLoading}
        customStyles={customStyles}
      />
    </div>
  );
};

export default NestedTable;
