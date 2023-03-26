import React, { useState, useRef } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useQuery } from "@tanstack/react-query";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
};

const fetchData = async () => {
  const { data } = await axios.get("http://127.0.0.1:8000/api/inventory/", {
    withCredentials: true,
  });
  return data;
};

const Inventory = () => {
  const [editQuantity, setEditQuantity] = useState();
  const { data, isLoading, isError } = useQuery(["inventory"], fetchData);

  if (isError) {
    return <div>Error fetching data</div>;
  }

  const columns = [
    {
      name: "Name",
      selector: (row) => row.component.description,
      sortable: true,
      wrap: true,
      innerWidth: "200px",
    },
    {
      name: "Supplier Item No",
      selector: (row) => row.component.supplier_item_no,
      sortable: true,
      wrap: true,
    },
    {
      name: "Capacitance (μF)",
      selector: (row) => row.component.farads,
      sortable: true,
    },
    {
      name: "Price (USD)",
      selector: (row) => row.component.price,
      sortable: true,
    },
    {
      name: "Quantity",
      cell: (row) => {
        return (
          <div className="flex justify-between w-full">
            {row.component.id === editQuantity ? (
              <div className="w-24">
                <input
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="number"
                  id={`${row.id}_quantity`}
                  min={0}
                  value={parseInt(row.quantity)}
                  onChange={(_name) => console.log(_name)}
                  onBlur={() => setEditQuantity(undefined)}
                />
              </div>
            ) : (
              <span>{row.quantity}</span>
            )}
            {row.component.id !== editQuantity && (
              <div
                onClick={() => {
                  setEditQuantity(
                    row.component.id !== editQuantity
                      ? row.component.id
                      : undefined
                  );
                }}
                role="button"
              >
                <PencilSquareIcon className="stroke-gray-500 w-4 h-4" />
              </div>
            )}
          </div>
        );
      },
      maxWidth: "8%",
      sortable: true,
    },
    {
      name: "Location",
      selector: (row) => (row.location ? row.location.join(", ") : "-"),
      sortable: true,
      wrap: true,
    },
    {
      name: "",
      sortable: false,
      cell: () => {
        return <TrashIcon role="button" className="stroke-gray-700 w-5 h-5" />;
      },
    },
  ];

  return (
    <DataTable
      fixedHeader
      pagination
      responsive
      subHeaderAlign="right"
      subHeaderWrap
      exportHeaders
      columns={columns}
      data={data}
      disabled={isLoading}
      customStyles={customStyles}
    />
  );
};

export default Inventory;
