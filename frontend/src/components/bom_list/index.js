import "tippy.js/dist/tippy.css";

import { Cart, Folder2 } from "react-bootstrap-icons";
import React, { useEffect, useMemo } from "react";

import Alert from "../../ui/Alert";
import DataTable from "react-data-table-component";
import NestedTable from "./nestedTable";
import Tabs from "../../ui/Tabs";
import Tippy from "@tippyjs/react";
import { prefetchComponentsData } from '../../services/usePreloadComponentsData';
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useModuleBomListItems from "../../services/useModuleBomListItems";
import { useQueryClient } from '@tanstack/react-query';

export const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
};

const filterByUniquePCBVersion = (data) => {
  // Extract and sort PCB versions for each unique item
  const sortedUniqueVersions = _(data)
    .flatMap((item) =>
      _(item.pcb_version)
        .sortBy((version) => version.order)
        .reverse()
        .map((version) => version.version)
        .value()
    )
    .uniq()
    .value();

  return sortedUniqueVersions;
};

const BomList = ({ moduleId, moduleName }) => {
  const [selectedTab, setSelectedTab] = React.useState();
  const [uniquePCBVersions, setUniquePCBVersions] = React.useState();
  const { user } = useAuthenticatedUser();
  const queryClient = useQueryClient()

  const { moduleBom, moduleBomIsLoading, moduleBomIsError } =
    useModuleBomListItems(moduleId);

  const moduleBomList = Array.isArray(moduleBom) ? moduleBom : [];

  const moduleBomData = moduleBomList.map((item) => ({
    ...item,
    moduleName,
    moduleId,
  }));

  console.log("uniquePCBVersions", uniquePCBVersions)

  useEffect(() => {
    setUniquePCBVersions(filterByUniquePCBVersion(moduleBomData));
  }, [moduleBomData?.length]);

  useEffect(() => {
    setSelectedTab(uniquePCBVersions ? uniquePCBVersions[0] : undefined);
  }, [uniquePCBVersions])

  const filteredData = useMemo(() => {
    return moduleBomData
      .filter((item) =>
        // Check if the item has the selected PCB version
        item.pcb_version.some((version) => version.version === selectedTab)
      )
      .map((item) => ({
        ...item,
        // Create a unique ID that combines item.id with the selectedTab to avoid duplication
        id: `${item.id}_${selectedTab}`,
      }));
  }, [selectedTab, moduleBomData]);

  const handleRowHover = (componentsOptions) => {
    prefetchComponentsData(queryClient, componentsOptions);
  };

  if (moduleBomIsLoading)
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );

  if (moduleBomIsError) {
    return <div>Error loading components: {moduleBomIsError.message}</div>;
  }

  const columns = [
    {
      name: <div className="sr-only">Alerts</div>,
      cell: (row) => {
        return (
          <div className="flex items-center space-x-2">
            <>
            {row.quantity <= row.sum_of_user_options_from_inventory && row.quantity > 0 && (
              <Tippy
                content={
                  "Your inventory has an adequate quantity of one or more components to fulfill this Bill of Materials (BOM) list item."
                }
              >
                <Folder2 className="fill-[#548a6a] w-4 h-4" />
              </Tippy>
            )}
            {row.quantity <= row.sum_of_user_options_from_shopping_list && row.quantity > 0 && (
              <Tippy
                content={
                  "Your shopping list has an adequate quantity of one or more components to fulfill this Bill of Materials (BOM) list item."
                }
              >
                <Cart className="fill-[#548a6a] w-4 h-4" />
              </Tippy>
            )}
            </>
          </div>
        );
      },
      sortable: false,
      width: "60px",
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
      maxWidth: "150px",
    },
    {
      name: <div>Notes</div>,
      selector: (row) => {
        return (
          <div className="truncate">{row.notes}</div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 2,
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row) =>
        row.quantity <= row.sum_of_user_options_from_inventory &&
        row.quantity > 0,
      style: {
        backgroundColor: "#fefad9",
        color: "black",
      },
    },
    {
      when: (row) =>
        row.quantity <= row.sum_of_user_options_from_shopping_list &&
        row.quantity > 0,
      style: {
        backgroundColor: "#fefad9",
        color: "black",
      },
    },
    {
      when: (row) =>
        row.quantity <= row.sum_of_user_options_from_shopping_list && 
        row.quantity <= row.sum_of_user_options_from_inventory &&
        row.quantity > 0,
      style: {
        backgroundColor: "#fdf4b3",
        color: "black",
      },
    },
  ];

  console.log(filteredData)

  return (
    <div className="mb-8">
      {!user && (
        <div className="mb-8">
          <Alert variant="warning">
            <div className="alert alert-warning" role="alert">
              <a
                href="/accounts/login/"
                className="text-blue-500 hover:text-blue-700"
              >
                <b>Login</b>
              </a>{" "}
              to compare the bill of materials (BOM) against your personal user
              inventory.
            </div>
          </Alert>
        </div>
      )}
      {uniquePCBVersions && uniquePCBVersions.length > 1 && selectedTab && (
        <div className="p-4 mb-4 bg-gray-100 rounded-lg">
          <h2 className="mb-2 font-bold text-md">PCB Versions:</h2>
          <Tabs
            activeTabColor="bg-[#568b6d] text-white hover:text-white hover:bg-[#4f7f63]"
            inactiveTabColor="bg-[#c9e2d3] text-gray-800 hover:bg-[#afd4be]"
            onClick={setSelectedTab}
            tabs={uniquePCBVersions?.map((name) => {
              return { name: name, current: name === selectedTab };
            })}
          />
        </div>
      )}
      {filteredData &&
        <DataTable
          fixedHeader={false}
          responsive
          exportHeaders
          expandableRows
          expandOnRowClicked
          fixedHeaderScrollHeight="500vh"
          progressComponent={
            <div className="text-center text-gray-500 animate-pulse">
              Loading...
            </div>
          }
          expandableRowsComponent={NestedTable}
          conditionalRowStyles={conditionalRowStyles}
          columns={columns}
          data={filteredData}
          progressPending={moduleBomIsLoading}
          customStyles={customStyles}
          onRowMouseEnter={(row) => {
            handleRowHover(row.components_options)
          }}
          keyField="id"
        />
      }
    </div>
  );
};

export default BomList;
