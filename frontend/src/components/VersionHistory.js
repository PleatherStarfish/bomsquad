import DataTable from "react-data-table-component";
import { DateTime } from "luxon";
import { JsonDiffComponent } from "json-diff-react";
import React from "react";
import _ from "lodash";
import useAuthenticatedUserHistory from "../services/useAuthenticatedUserHistory";
import useGetComponentsByIds from "../services/useGetComponentsByIds";
import BackButton from "../ui/BackButton";

const Component = ({ componentPks }) => {
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponentsByIds(componentPks);

  if (componentsAreLoading)
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  if (componentsAreError) return <div>Error!</div>;

  const component = componentsData?.[0];

  return <span>{component?.description}</span>;
};

const QuantDiff = ({ before, after }) => {
  if (before < after) {
    // Adding to quantity
    return (
      <>
        <span className="font-bold text-green-500">
          {`+${Math.abs(before - after)} `}
        </span>
      </>
    );
  }
  if (before > after) {
    // Subtracting from quantity
    return (
      <>
        <span className="font-bold text-red-500">
          {`-${Math.abs(before - after)} `}
        </span>
      </>
    );
  }
};

const Supplier = ({ componentPks }) => {
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponentsByIds(componentPks);

  if (componentsAreLoading)
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  if (componentsAreError) return <div>Error!</div>;

  const component = componentsData?.[0];

  return <span>{component?.supplier?.short_name}</span>;
};

const SupplierItemNo = ({ componentPks }) => {
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponentsByIds(componentPks);

  if (componentsAreLoading)
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  if (componentsAreError) return <div>Error!</div>;

  const component = componentsData?.[0];

  return (
    <a href={component?.link} className="text-blue-500 hover:text-blue-700">
      {component?.supplier_item_no}
    </a>
  );
};

const customStyles = {
  rows: {
    style: {
      padding: "0.2rem 0 0.2rem 0",
    },
  },
};

const VersionHistory = () => {
  const { userHistory, userHistoryIsLoading, userHistoryIsError } =
    useAuthenticatedUserHistory();

  if (userHistoryIsLoading)
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  if (userHistoryIsError) return <div>Error!</div>;

  const columns = [
    {
      name: <div className="text-bold">Timestamp</div>,
      selector: (row) => {
        return (
          <span>
            {new Date(row.timestamp).toLocaleString(DateTime.DATETIME_MED)}
          </span>
        );
      },
      sortable: false,
    },
    {
      name: <div className="font-bold">Component</div>,
      selector: (row) => <Component componentPks={row.component_id} />,
      sortable: false,
    },
    {
      name: <div className="font-bold">Supplier</div>,
      selector: (row) => <Supplier componentPks={row.component_id} />,
      sortable: false,
    },
    {
      name: <div className="font-bold">Supp. Item #</div>,
      selector: (row) => <SupplierItemNo componentPks={row.component_id} />,
      sortable: false,
    },
    {
      name: <div className="font-bold">Quantity diff.</div>,
      selector: (row) => (
        <QuantDiff before={row.quantity_before} after={row.quantity_after} />
      ),
      sortable: false,
    },
    {
      name: <div className="font-bold">Location diff.</div>,
      selector: (row) =>
        (row.location_before || row.location_after) &&
        !_.isEqual(row.location_before, row.location_after) ? (
          <JsonDiffComponent
            jsonA={row.location_before}
            jsonB={row.location_after}
            jsonDiffOptions={{
              verbose: false,
              full: true,
            }}
            styleCustomization={{
              additionLineStyle: { color: "#22c55e" },
              deletionLineStyle: { color: "#ef4444" },
              unchangedLineStyle: { color: "#6b7280" },
              frameStyle: {
                background: "white",
              },
            }}
          />
        ) : undefined,
      sortable: false,
    },
  ];

  return (
    <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
      <BackButton prevPageName="Account" />
      <h1 className="mt-5 mb-12 text-3xl font-bold text-gray-700">
        Inventory Version History
      </h1>
      <div>
        <DataTable
          compact
          responsive
          noHeader
          pagination
          paginationPerPage={50}
          paginationRowsPerPageOptions={[50, 100, 200]}
          columns={columns}
          data={userHistory?.history}
          progressPending={userHistoryIsLoading}
          customStyles={customStyles}
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

export default VersionHistory;
