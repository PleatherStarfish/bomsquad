import DataTable from "react-data-table-component";
import Pill from "../../ui/Pill";
import React from "react";
import cx from 'classnames';

const LocationsList = ({ row, pointerEvents }) => {
  const locations = row?.locations ?? [];

  return (
    <div className={cx("flex", pointerEvents)}>
      {locations.length > 0 ? (
        locations.map((location, index) => (
          <Pill 
            key={index} 
            showArrow={index !== locations.length - 1} 
            showXMark={false} 
            border="border-1" 
            color="bg-white" 
            textColor="text-slate-500"
          >
            {location}
          </Pill>
        ))
      ) : (
        <span className="font-mono">[no location specified]</span>
      )}
    </div>
  );
};

const LocationsTable = ({ data, onRowClicked, pointerEvents = "pointer-events-auto" }) => {
  const columns = [
    {
      name: "Location",
      cell: (row) => <LocationsList row={row} pointerEvents={pointerEvents} />,
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
      pointerOnHover: true
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
