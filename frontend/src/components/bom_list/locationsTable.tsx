import DataTable, { TableColumn } from "react-data-table-component";
import Pill from "../../ui/Pill";
import React from "react";
import cx from "classnames";

interface LocationRow {
  locations: string[];
  quantity: number;
}

interface LocationsListProps {
  row: LocationRow;
  pointerEvents?: string;
}

const LocationsList: React.FC<LocationsListProps> = ({ row, pointerEvents }) => {
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

interface LocationsTableProps {
  data: LocationRow[];
  onRowClicked?: (row: LocationRow) => void;
  pointerEvents?: string;
}

const LocationsTable: React.FC<LocationsTableProps> = ({ data, onRowClicked, pointerEvents = "pointer-events-auto" }) => {
  const columns: TableColumn<LocationRow>[] = [
    {
      cell: (row) => <LocationsList pointerEvents={pointerEvents} row={row} />,
      grow: 3,
      name: "Location",
      sortable: false,
      wrap: false,
    },
    {
      maxWidth: "50px",
      name: "Quantity",
      selector: (row) => row.quantity,
      sortable: false,
      wrap: false,
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
