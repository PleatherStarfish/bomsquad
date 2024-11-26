import "tippy.js/dist/tippy.css";

import { BomItem, BomListProps, PcbVersion } from "../../types/bomListItem";
import { Cart, CheckLg, Folder2 } from "react-bootstrap-icons";
import DataTable, { TableColumn } from "react-data-table-component";
import React, { useEffect, useMemo, useState } from "react";
import { animateScroll } from "react-scroll";
import { flatMap, uniqBy } from "lodash-es";
import { useForm } from "react-hook-form";


import Alert from "../../ui/Alert";
import CheckboxGridModal from "./checkboxGridModal";
import DropdownButton from "../../ui/DropdownButton";
import FullPageModal from "../components/FullPageModal";
import NestedTable from "./nestedTable";
import RadioGroup from "../../ui/RadioGroup";
import Tippy from "@tippyjs/react";
import { prefetchComponentsData } from "../../services/usePreloadComponentsData";
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
  const flattenedVersions = flatMap(data, (item: BomItem) => item.pcb_version);
  const sortedVersions = flattenedVersions.sort((a, b) => b.order - a.order);
  const uniqueVersions = uniqBy(
    sortedVersions,
    (version: PcbVersion) => version.version
  );
  return uniqueVersions.map((version) => version.version);
};

// Helper function to generate a unique key for each item and selected tab
const generateUniqueKey = (itemId: string, tabName: string) =>
  `${itemId}_${tabName}`;

const BomList: React.FC<BomListProps> = ({
  moduleId,
  moduleName,
  bomUnderConstruction,
  handleExportButtonClick,
  exportModalOpen,
}) => {
  const [selectedTab, setSelectedTab] = useState<string | undefined>();
  const [uniquePCBVersions, setUniquePCBVersions] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [exportOutput, setExportOutput] = useState<string>("");
  const [userSelection, setUserSelection] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const { control, getValues, reset } = useForm<{
    [key: string]: boolean;
  }>();

  // Fetch module BOM data
  const { moduleBom, moduleBomIsLoading, moduleBomIsError } =
    useModuleBomListItems(moduleId);
  const moduleBomList: BomItem[] = Array.isArray(moduleBom) ? moduleBom : [];

  // Annotate each item with moduleName and moduleId for easier usage
  const moduleBomData: BomItem[] = moduleBomList.map((item) => ({
    ...item,
    moduleId,
    moduleName,
  }));

  const hasOptionalColumn = () => moduleBomData.some((item) => item.optional);

  useEffect(() => {
    setUniquePCBVersions(getUniqueSortedPCBVersionNames(moduleBomData));
    console.log(getUniqueSortedPCBVersionNames(moduleBomData));
  }, [moduleBomData.length]);

  useEffect(() => {
    setSelectedTab(uniquePCBVersions[0]);
  }, [uniquePCBVersions]);

  const setHasSelection = (selected: boolean) => {
     setUserSelection(selected)
  }

  const filteredData = useMemo(() => {
    return (
      moduleBomData
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
        }, [])
    );
  }, [selectedTab, moduleBomData]);

  const handleRowHover = (componentsOptions: string[]) => {
    prefetchComponentsData(queryClient, componentsOptions);
  };

  // Short-circuit and display an alert if BOM is under construction
  if (bomUnderConstruction) {
    return (
      <div className="w-full mb-8">
        <Alert align="center" expand={false} icon variant="underConstruction">
          <div className="text-center">
            This BOM is currently under construction. Please check back later.
          </div>
        </Alert>
      </div>
    );
  }

  if (moduleBomIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  if (moduleBomIsError) {
    return <div>Error loading components.</div>;
  }

  // Define columns for the DataTable component
  const columns: TableColumn<BomItem>[] = [
    {
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
      name: <div className="sr-only">Alerts</div>,
      sortable: false,
      width: "60px",
    },
    {
      grow: 1,
      name: <div>Name</div>,
      selector: (row) => row.description,
      sortable: true,
      wrap: true,
    },
    {
      maxWidth: "50px",
      name: <div>Qty</div>,
      selector: (row) => row.quantity,
      sortable: true,
      wrap: true,
    },
    {
      name: <div>Type</div>,
      selector: (row) => row.type.name, // Assuming `type` is an object with a `name` property
      sortable: true,
      wrap: true,
    },
    {
      maxWidth: "150px",
      name: <div>Designators</div>,
      selector: (row) => row.designators,
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) => row.optional && <CheckLg className="w-5 h-5" />,
      maxWidth: "50px",
      name: <div>Optional</div>,
      omit: !hasOptionalColumn,
      sortable: false,
    },
    {
      format: (row) => <div className="truncate">{row.notes}</div>,
      grow: 2,
      name: <div>Notes</div>,
      selector: (row) => row.notes,
      // Truncated display
      sortable: true,
      wrap: true,
    },
  ];

  const conditionalRowStyles = [
    {
      style: {
        backgroundColor: "#fefad9",
        color: "black",
      },
      when: (row: BomItem) =>
        row.quantity <= (row.sum_of_user_options_from_inventory ?? 0) &&
        row.quantity > 0,
    },
    {
      style: {
        backgroundColor: "#fefad9",
        color: "black",
      },
      when: (row: BomItem) =>
        row.quantity <= (row.sum_of_user_options_from_shopping_list ?? 0) &&
        row.quantity > 0,
    },
    {
      style: {
        backgroundColor: "#fdf4b3",
        color: "black",
      },
      when: (row: BomItem) =>
        row.quantity <= (row.sum_of_user_options_from_inventory ?? 0) &&
        row.quantity <= (row.sum_of_user_options_from_shopping_list ?? 0) &&
        row.quantity > 0,
    },
  ];

  return (
    <>
      <div className="mb-8">
        {uniquePCBVersions.length > 1 && selectedTab && (
          <div className="w-full mb-8">
            <RadioGroup
              centered={false}
              defaultSelected={selectedTab}
              layout="horizontal"
              legend="Select a PCB Version"
              legendSrOnly
              name="pcb-version"
              onChange={setSelectedTab}
              options={uniquePCBVersions.map((name) => ({
                id: name,
                title: name,
              }))}
            />
          </div>
        )}
        {filteredData && (
          <DataTable
            columns={columns}
            conditionalRowStyles={conditionalRowStyles}
            customStyles={customStyles}
            data={filteredData}
            expandableRows
            expandableRowsComponent={NestedTable}
            expandOnRowClicked
            fixedHeader={false}
            fixedHeaderScrollHeight="500vh"
            keyField="id"
            onRowMouseEnter={(row: BomItem) =>
              handleRowHover(row.components_options)
            }
            progressComponent={
              <div className="text-center text-gray-500 animate-pulse">
                Loading...
              </div>
            }
            progressPending={moduleBomIsLoading}
            responsive
          />
        )}
      </div>
      <FullPageModal
        customButtons={
          <div className="flex w-full gap-x-4">
            <div className="grow">
              {userSelection && <button
                className="inline-flex justify-center w-full px-3 py-2 text-sm font-semibold text-white bg-[#3c82f6] rounded-md shadow-sm sm:ml-3 sm:w-auto hover:bg-blue-700 cursor-pointer"
                onClick={() =>
                  animateScroll.scrollToBottom({
                    containerId: "modal-content-container",
                    duration: 300,
                    smooth: true,
                  })
                }
              >
                See as text & copy/paste
              </button>}
            </div>
            <button
              className="inline-flex justify-center w-full px-3 py-2 mt-3 text-sm font-semibold text-gray-900 bg-white rounded-md shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              onClick={() => handleExportButtonClick(false)}
              type="button"
            >
              Cancel
            </button>
            <DropdownButton
              onExportCsv={() => {}}
              onExportText={() => {}}
            />
          </div>
        }
        onSubmit={() => {
          alert("Exporting BOM...");
          handleExportButtonClick(false);
        }}
        open={exportModalOpen}
        setOpen={handleExportButtonClick}
        submitButtonText="Export"
        subtitle="Export your BOM in .csv, .xlsx, or JSON formats. Supported import tools include Mouser, DigiKey, or TME via file export or copy/paste. Login or create an account to see the intersection of shopping lists for multiple BOMs using the meta-shopping list tool."
        title={`Quick Export the BOM for ${moduleName}${ uniquePCBVersions.length > 1 ? ` - ${selectedTab}` : "" }`}
        type="info"
      >
          <CheckboxGridModal bomData={moduleBom ?? []} control={control} getValues={getValues} reset={reset} selectedPCBVersion={selectedTab} setHasSelection={setHasSelection} />
      </FullPageModal>
    </>
  );
};

export default BomList;
