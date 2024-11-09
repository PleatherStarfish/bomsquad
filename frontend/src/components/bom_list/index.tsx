import "tippy.js/dist/tippy.css";

import { BomItem, BomListProps, PcbVersion } from "../../types/bomListItem";
import { Cart, Folder2 } from "react-bootstrap-icons";
import DataTable, { TableColumn } from "react-data-table-component";
import React, { useEffect, useMemo, useState } from "react";
import { flatMap, sortBy, uniq } from 'lodash-es';

import Alert from "../../ui/Alert";
import NestedTable from "./nestedTable";
import Tabs from "../../ui/Tabs";
import Tippy from "@tippyjs/react";
import { prefetchComponentsData } from "../../services/usePreloadComponentsData";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useModuleBomListItems from "../../services/useModuleBomListItems";
import { useQueryClient } from "@tanstack/react-query";

export const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
};

// Helper function to extract unique PCB version names sorted by order
const getUniqueSortedPCBVersionNames = (data: BomItem[]): string[] => {
  return uniq(
    flatMap(data, (item: BomItem) =>
      sortBy(item.pcb_version, (version: PcbVersion) => version.order)
        .map((version: PcbVersion) => version.version)
    )
  );
};

// Helper function to generate a unique key for each item and selected tab
const generateUniqueKey = (itemId: string, tabName: string) => `${itemId}_${tabName}`;

const BomList: React.FC<BomListProps> = ({ moduleId, moduleName, bomUnderConstruction }) => {
  const [selectedTab, setSelectedTab] = useState<string | undefined>();
  const [uniquePCBVersions, setUniquePCBVersions] = useState<string[]>([]);
  const { user } = useAuthenticatedUser();
  const queryClient = useQueryClient();

  // Fetch module BOM data
  const { moduleBom, moduleBomIsLoading, moduleBomIsError } = useModuleBomListItems(moduleId);
  const moduleBomList: BomItem[] = Array.isArray(moduleBom) ? moduleBom : [];

  // Annotate each item with moduleName and moduleId for easier usage
  const moduleBomData: BomItem[] = moduleBomList.map((item) => ({
    ...item,
    moduleName,
    moduleId,
  }));

  useEffect(() => {
    setUniquePCBVersions(getUniqueSortedPCBVersionNames(moduleBomData));
  }, [moduleBomData.length]);

  useEffect(() => {
    setSelectedTab(uniquePCBVersions[0]);
  }, [uniquePCBVersions]);

  const filteredData = useMemo(() => {
    return moduleBomData
      // Step 1: Filter `moduleBomData` to include only items associated with the selected PCB version tab.
      .filter((item) =>
        item.pcb_version.some((version) => version.version === selectedTab)
      )
      // Step 2: Reduce the filtered list to ensure unique entries by combining each item ID with the selected tab.
      // This prevents duplication of items appearing in multiple versions.
      .reduce<BomItem[]>((uniqueItems, item) => {
        // Generate a unique key for each item by combining its ID with the selected tab.
        const uniqueKey = generateUniqueKey(item.id, selectedTab || "");
  
        // Step 3: Check if an item with this unique key is already in the list.
        // If not, add the item to the unique list with its unique key as the ID.
        if (!uniqueItems.some((uniqueItem) => uniqueItem.id === uniqueKey)) {
          uniqueItems.push({
            ...item,
            id: uniqueKey,
          });
        }
        return uniqueItems;
      }, []);
  }, [selectedTab, moduleBomData]);

  const handleRowHover = (componentsOptions: string[]) => {
    prefetchComponentsData(queryClient, componentsOptions);
  };

  // Short-circuit and display an alert if BOM is under construction
  if (bomUnderConstruction) {
    return (
      <div className="w-full mb-8">
        <Alert variant="underConstruction" align="center" expand={false} icon>
          <div className="text-center">
            This BOM is currently under construction. Please check back later.
          </div>
        </Alert>
      </div>
    );
  }

  if (moduleBomIsLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }

  if (moduleBomIsError) {
    return <div>Error loading components.</div>;
  }

  // Define columns for the DataTable component
  const columns: TableColumn<BomItem>[] = [
    {
      name: <div className="sr-only">Alerts</div>,
      cell: (row) => (
        <div className="flex items-center space-x-2">
          {row.quantity <= (row.sum_of_user_options_from_inventory ?? 0) &&
            row.quantity > 0 && (
              <Tippy content="Your inventory has an adequate quantity of one or more components to fulfill this BOM item.">
                <Folder2 className="fill-[#548a6a] w-4 h-4" />
              </Tippy>
            )}
          {row.quantity <= (row.sum_of_user_options_from_shopping_list ?? 0) &&
            row.quantity > 0 && (
              <Tippy content="Your shopping list has an adequate quantity of one or more components to fulfill this BOM item.">
                <Cart className="fill-[#548a6a] w-4 h-4" />
              </Tippy>
            )}
        </div>
      ),
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
      selector: (row) => row.type.name, // Assuming `type` is an object with a `name` property
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
      selector: (row) => row.notes,
      format: (row) => <div className="truncate">{row.notes}</div>, // Truncated display
      sortable: true,
      wrap: true,
      grow: 2,
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row: BomItem) =>
        row.quantity <= (row.sum_of_user_options_from_inventory ?? 0) &&
        row.quantity > 0,
      style: {
        backgroundColor: "#fefad9",
        color: "black",
      },
    },
    {
      when: (row: BomItem) =>
        row.quantity <= (row.sum_of_user_options_from_shopping_list ?? 0) &&
        row.quantity > 0,
      style: {
        backgroundColor: "#fefad9",
        color: "black",
      },
    },
    {
      when: (row: BomItem) =>
        row.quantity <= (row.sum_of_user_options_from_inventory ?? 0) &&
        row.quantity <= (row.sum_of_user_options_from_shopping_list ?? 0) &&
        row.quantity > 0,
      style: {
        backgroundColor: "#fdf4b3",
        color: "black",
      },
    },
  ];

  return (
    <div className="mb-8">
      {!user && (
        <Alert variant="warning" padding="compact">
          <div className="alert alert-warning" role="alert">
            <a href="/accounts/login/" className="text-blue-500 hover:text-blue-700">
              <b>Login</b>
            </a>{" "}
            to compare the BOM against your personal inventory.
          </div>
        </Alert>
      )}
      {uniquePCBVersions.length > 1 && selectedTab && (
        <div className="p-4 mb-4 bg-gray-100 rounded-lg">
          <h2 className="mb-2 font-bold text-md">PCB Versions:</h2>
          <Tabs
            activeTabColor="bg-[#568b6d] text-white hover:text-white hover:bg-[#4f7f63]"
            inactiveTabColor="bg-[#c9e2d3] text-gray-800 hover:bg-[#afd4be]"
            onClick={setSelectedTab}
            tabs={uniquePCBVersions.map((name) => ({
              name,
              current: name === selectedTab,
            }))}
          />
        </div>
      )}
      {filteredData && (
        <DataTable
          fixedHeader={false}
          responsive
          expandableRows
          expandOnRowClicked
          fixedHeaderScrollHeight="500vh"
          progressComponent={
            <div className="text-center text-gray-500 animate-pulse">Loading...</div>
          }
          expandableRowsComponent={NestedTable}
          conditionalRowStyles={conditionalRowStyles}
          columns={columns}
          data={filteredData}
          progressPending={moduleBomIsLoading}
          customStyles={customStyles}
          onRowMouseEnter={(row: BomItem) => handleRowHover(row.components_options)}
          keyField="id"
        />
      )}
    </div>
  );
};

export default BomList;
