import React from "react";
import DataTable from "react-data-table-component";
import useModuleBomListItems from "../../services/useModuleBomListItems";
import NestedTable from "./nestedTable";
import Alert from "../../ui/Alert";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import { Check2Circle } from "react-bootstrap-icons";
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

export const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
};

const BomList = ({ moduleId, moduleName }) => {

  const { user, userIsLoading } = useAuthenticatedUser();

  const { moduleBom, moduleBomIsLoading, moduleBomIsError } =
    useModuleBomListItems(moduleId);

  if (moduleBomIsLoading)
    return <div className="text-gray-700 animate-pulse">Loading...</div>;

  if (moduleBomIsError) {
    return <div>Error loading components: {moduleBomIsError.message}</div>;
  }

  console.log(moduleBom)

  const moduleBomData = moduleBom.map((item) => ({
    ...item,
    moduleName,
    moduleId,
  }));

  const columns = [
    {
      name: <div className="sr-only">Alerts</div>,
      cell: (row) => {
        return (row.quantity <= row.sum_of_user_options_from_inventory && 
          <Tippy content={"Your inventory has an adequate quantity of one or more components to fulfill this Bill of Materials (BOM) list item."}>
            <Check2Circle className="fill-[#548a6a] w-8 h-8" />
          </Tippy>
        )
      },
      sortable: false,
      width: "60px"
    },
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
      grow: 2,
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) => row.quantity <= row.sum_of_user_options_from_inventory,
      style: {
        backgroundColor: "#fdf4b3",
        color: "black",
      },
    },
  ];

  return (
    <div className="mb-8">
      {!!user || (
        <div className="mb-8">
          <Alert variant="warning">
            <div className="alert alert-warning" role="alert">
              <a href="/accounts/login/" className="text-blue-500 hover:text-blue-700">
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
        exportHeaders
        expandableRows
        expandOnRowClicked
        progressComponent={<div className="text-gray-700 animate-pulse">Loading...</div>}
        expandableRowsComponent={NestedTable}
        conditionalRowStyles={conditionalRowStyles}
        columns={columns}
        data={moduleBomData}
        progressPending={moduleBomIsLoading}
        customStyles={customStyles}
      />
      {!userIsLoading && (
        <p className="text-gray-500 pt-16 italic">
          Bom Squad is not responsible for the accuracy of the bill of materials
          or other information about Eurorack modules contained on the site.
          Please read our full{" "}
          <a href="/disclaimer/" className="text-blue-500 hover:text-blue-800">
            Liability Disclaimer
          </a>{" "}
          for more information.
        </p>
      )}
    </div>
  );
};

export default BomList;
