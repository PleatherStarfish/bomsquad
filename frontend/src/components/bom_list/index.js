import React from "react";
import DataTable from "react-data-table-component";
import useModuleBomListItems from "../../services/useModuleBomListItems";
import NestedTable from "./nestedTable";
import Alert from "../../ui/Alert";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";

export const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
  rows: {
    style: {
      padding: "0.5rem 0 0.5rem 0",
    },
  },
};

const BomList = ({ moduleId, moduleName }) => {
  const { user, userIsLoading } = useAuthenticatedUser();
  const { moduleBom, moduleBomIsLoading, moduleBomIsError } =
    useModuleBomListItems(moduleId);

  if (moduleBomIsLoading) return <div className="text-gray-700 animate-pulse">Loading...</div>;
  if (moduleBomIsError) {
    return <div>Error loading components: {moduleBomIsError.message}</div>;
  }

  const moduleBomData = moduleBom.map(item => ({...item, moduleName, moduleId}));

  const columns = [
    {
      name: <div>Name</div>,
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
      grow: 1,
    },
    {
      name: <div>Qty</div>,
      selector: (row) => row.quantity,
      sortable: true,
      wrap: true,
      maxWidth: "50px",
    },
    {
      name: <div>Type</div>,
      selector: (row) => row.type,
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Designators</div>,
      selector: (row) => row.designators,
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Notes</div>,
      selector: (row) => row.notes,
      sortable: true,
      wrap: true,
      grow: 1,
    },
  ];

  return (
    <div className="mb-8">
      {!user && !userIsLoading && (
        <div className="mb-8">
          <Alert variant="warning">
            <div className="alert alert-warning" role="alert">
              <a href="/accounts/login/">
                <b>Login</b>
              </a>{" "}
              to compare the bill of materials (BOM) against your personal user
              inventory.
            </div>
          </Alert>
        </div>
      )}
      <DataTable
        fixedHeader
        responsive
        subHeaderAlign="right"
        subHeaderWrap
        exportHeaders
        expandableRows
        expandOnRowClicked
        expandableRowsComponent={NestedTable}
        columns={columns}
        data={moduleBomData}
        progressPending={moduleBomIsLoading}
        customStyles={customStyles}
      />
      {!userIsLoading && <p className="text-gray-500 pt-16 italic">
        Bom Squad is not responsible for the accuracy of the bill of materials
        or other information about Eurorack modules contained on the site.
        Please read our full <a href="/disclaimer/" className="text-blue-500 hover:text-blue-800">Liability Disclaimer</a> for more information.
      </p>}
    </div>
  );
};

export default BomList;
