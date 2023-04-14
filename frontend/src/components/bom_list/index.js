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

const BomList = ({ module_id }) => {
  const { user, userIsLoading } = useAuthenticatedUser();
  const { moduleBom, moduleBomIsLoading, moduleBomIsError } =
    useModuleBomListItems(module_id);

  if (moduleBomIsError) {
    return <div>Error loading components: {moduleBomIsError.message}</div>;
  }

  const columns = [
    {
      name: "Name",
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
    },
    {
      name: "Quantity Required",
      selector: (row) => row.quantity,
      sortable: true,
      wrap: true,
    },
    {
      name: "Type",
      selector: (row) => row.type,
      sortable: true,
      wrap: true,
    },
    {
      name: "Designators",
      selector: (row) => row.designators,
      sortable: true,
      wrap: true,
    },
    {
      name: "Notes",
      selector: (row) => row.notes,
      sortable: true,
      wrap: true,
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
        data={moduleBom}
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
