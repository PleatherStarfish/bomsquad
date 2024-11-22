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
            border="border-1" 
            color="bg-white" 
            key={index} 
            showArrow={index !== locations.length - 1} 
            showXMark={false} 
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
      cell: (row) => <LocationsList pointerEvents={pointerEvents} row={row} />,
      grow: 3,
      name: "Location",
      pointerOnHover: true,
      sortable: false,
      wrap: false
    },
    {
      maxWidth: "50px",
      name: "Quantity",
      pointerOnHover: true,
      selector: (row) => row.quantity,
      sortable: false,
      wrap: false
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      dense
      highlightOnHover
      noHeader
      onRowClicked={onRowClicked}
    />
  );
};

export default LocationsTable;
