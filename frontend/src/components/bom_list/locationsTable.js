import DataTable from "react-data-table-component";
import Pill from "../../ui/Pill";
import React from "react";

const LocationsTable = ({ data, onRowClicked }) => {
  const columns = [
    {
      name: "Location",
      cell: (row) => (
        <div className="flex">
          {!!(row?.locations ?? []).length ? row.locations.map((location, index) => (
            <Pill key={index} showArrow={index !== row.locations.length - 1} showXMark={false} border="border-1" color="bg-white" textColor="text-slate-500">{location}</Pill>
          )) : <span className="font-mono">{"[no location specified]"}</span>}
        </div>
      ),
      sortable: false,
      wrap: false,
      grow: 3,
      pointerOnHover: true
    },
    {
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: false,
      wrap: false,
      maxWidth: "50px",
    },
  ];

  return (
      <DataTable
        columns={columns}
        data={data}
        onRowClicked={onRowClicked}
        noHeader
        dense
        highlightOnHover
      />
  );
};

export default LocationsTable;
