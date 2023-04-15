import React, { useState } from "react";
import axios from "axios";
import DataTable from "react-data-table-component";
import { useQuery } from "@tanstack/react-query";
import { TrashIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import Button from "../ui/Button";

import Pill from "../ui/Pill";

const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
};

const fetchData = async () => {
  const { data } = await axios.get("/api/inventory/", {
    withCredentials: true,
  });
  return data;
};

const Inventory = () => {
  const [editQuantity, setEditQuantity] = useState();
  const [editLocation, setEditLocation] = useState();
  const { data, isLoading, isError } = useQuery(["inventory"], fetchData);

  if (isError) {
    return <div>Error fetching data</div>;
  }

  const handleDownloadCSV = () => {
    const csvData =
      "data:text/csv;charset=utf-8," +
      encodeURIComponent(
        data
          .map((row) =>
            [
              row.component.description,
              row.component.supplier_item_no,
              row.component.farads,
              row.component.price,
              row.quantity,
              row.location
                ? row.location.join(", ").replace(", ", " -> ")
                : "-",
            ].join(",")
          )
          .join("\n")
      );

    const downloadLink = document.createElement("a");
    downloadLink.setAttribute("href", csvData);
    downloadLink.setAttribute("download", "inventory.csv");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const locationsSort = (locationA, locationB) => {
    const a = locationA && Array.isArray(locationA.location)
      ? locationA.location.join(",").toLowerCase()
      : '';
    const b = locationB && Array.isArray(locationB.location)
      ? locationB.location.join(",").toLowerCase()
      : '';

    if (a > b) {
      return 1;
    }

    if (b > a) {
      return -1;
    }

    return 0;
  };

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
                  className="block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
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
                <PencilSquareIcon className="stroke-slate-500 w-4 h-4 hover:stroke-pink-500" />
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
      cell: (row) => (
        <div className="flex justify-between w-full">
          {row.component.id === editLocation ? (
            <div className="flex gap-1.5 pb-1 pt-6">
              <div className="flex flex-col justify-around">
                <input
                  className="block w-full h-8 rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  id={`${row.id}_location`}
                  min={0}
                  value={row.location && row.location.join(", ")}
                />
                <p className="text-gray-500 text-xs">
                  Separate locations with commas.
                </p>
              </div>
              <div className="h-full flex flex-col">
                <Button
                  size="sm"
                  variant="muted"
                  onClick={() => setEditLocation(undefined)}
                >
                  Close
                </Button>
              </div>
              <div className="h-full flex flex-col">
                <Button size="sm" variant="primary">
                  Submit
                </Button>
              </div>
            </div>
          ) : (
            <ul className="flex flex-wrap w-full">
              {row.location
                ? row.location.map((item, index) => (
                    <Pill
                      key={index}
                      showArrow={index !== row.location.length - 1}
                    >
                      {item}
                    </Pill>
                  ))
                : "-"}
            </ul>
          )}
          {row.component.id !== editLocation && (
            <div
              className="flex flex-col justify-center"
              onClick={() => {
                setEditLocation(
                  row.component.id !== editLocation
                    ? row.component.id
                    : undefined
                );
              }}
              role="button"
            >
              <PencilSquareIcon className="stroke-slate-500 w-4 h-4 hover:stroke-pink-500" />
            </div>
          )}
        </div>
      ),
      sortable: true,
      wrap: true,
      minWidth: editLocation ? "30%" : "15%",
      sortFunction: locationsSort,
    },
    {
      name: "",
      sortable: false,
      cell: () => {
        return (
          <TrashIcon
            role="button"
            className="stroke-slate-500 w-5 h-5 hover:stroke-pink-500"
          />
        );
      },
      width: "5%",
      minWidth: "50px"
    },
  ];

  return (
    <>
      <div className="w-full flex justify-end">
        {data && data.length > 0 && <button
          className="inline-flex items-center px-2 py-1 border border-transparent text-base font-medium rounded-md text-white bg-brandgreen-500 hover:bg-brandgreen-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandgreen-500"
          onClick={handleDownloadCSV}
        >
          Download CSV
        </button>}
      </div>
      <DataTable
        fixedHeader
        pagination
        responsive
        subHeaderAlign="right"
        subHeaderWrap
        exportHeaders
        columns={columns}
        data={data}
        progressPending={isLoading}
        customStyles={customStyles}
      />
    </>
  );
};

export default Inventory;
