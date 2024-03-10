import React, { useEffect, useState } from "react";
import useGetComponentsByIds, {
  getComponentsByIds,
} from "../../services/useGetComponentsByIds";

import Accordion from "../../ui/Accordion";
import LocationsTable from "../bom_list/locationsTable";
import MultiPageModal from "../../ui/MultiPageModal";
import SimpleEditableLocation from "../inventory/SimpleEditableLocation";
import useGetInventoryLocations from "../../services/useGetInventoryLocations";
import useGetInventoryLocationsMultiple from "../../services/useGetInventoryLocationsMultiple";
import { useQueryClient } from "@tanstack/react-query";

const InventoryLocationEditor = ({
  componentId, setMutatedComponentLocationsObject
}) => {

  // 
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponentsByIds([componentId]);
  
  const [locationArray, setLocationArray] = useState([]);

  const {
    data: locations,
    isLoading: isLoadingLocation,
    isError: isErrorLocation,
  } = useGetInventoryLocations(componentId);

  const locationsData = locations?.data ?? [];
  const savedLocationsData = Array.isArray(locationsData)
    ? locationsData.map((item) => ({
        locations: item.location || [],
        quantity: item.quantity,
      }))
    : [];

  const handleLocationChange = (newLocationArray) => {
    setLocationArray(newLocationArray);

    const locationString = newLocationArray.join(",");
    setMutatedComponentLocationsObject(prevState => ({
      ...prevState,
      [componentId]: locationString
    }));
  };

  // if (componentsAreError || isErrorLocation) {
  //   return <div>Error fetching data</div>;
  // }

  // console.log("two")

  // if (componentsAreLoading || isLoadingLocation) {
  //   return (
  //     <div className="text-center text-gray-500 animate-pulse">Loading...</div>
  //   );
  // }

  return (
    <>
      <div className="p-4 mt-4 mb-2 bg-gray-100 rounded-md">
        <h4 className="my-2 text-sm font-bold text-slate-900">
          {`${componentsData?.[0]?.description} (${componentsData?.[0]?.supplier.name} ${componentsData?.[0]?.supplier_item_no}).`}
        </h4>
        <p className="mb-2 text-xs font-bold text-slate-500">Separate locations with commas.</p>

        <div key={componentId}>
          <SimpleEditableLocation
            locationArray={locationArray}
            submitLocationChange={handleLocationChange}
            showSeparateLocationsWithCommas={false}
          />
        </div>
        {savedLocationsData.length > 0 && (
            <div>
              <Accordion
                headerClasses="text-sm text-slate-500"
                title={`Your inventory locations for ${componentsData?.[0]?.supplier.short_name} ${componentsData?.[0]?.supplier_item_no}`}
              >
                <div className="p-4 rounded-md bg-blue-50">
                  <p className="mb-4 text-xs text-slate-500">
                    It looks like you already have this component in your
                    inventory. Click to select a pre-existing location.
                  </p>
                  <LocationsTable
                    data={savedLocationsData}
                    onRowClicked={(row) => handleLocationChange(row.locations)}
                  />
                </div>
              </Accordion>
            </div>
          )}
      </div>
    </>
  );
};

const AddAllModal = ({
  addAllModalOpen,
  setAddAllModalOpen,
  addAllToInventoryMutation,
  userShoppingListData,
}) => {
  const queryClient = useQueryClient();
  const [componentInventoryStates, setComponentInventoryStates] = useState([]);

  // An object that maps component ids to locations set by the user when submitting all components to inventory
  const [mutatedComponentLocationsObject, setMutatedComponentLocationsObject] = useState({});
  
  const { inventoryData, isLoading, isError } =
    useGetInventoryLocationsMultiple(
      userShoppingListData?.aggregatedComponents.map(
        (item) => item.component.id
      )
    );

  // useEffect(() => {
  //   if (inventoryData?.data) {
  //     // Initialize the state for each location
  //     setComponentInventoryStates(
  //       Object.entries(inventoryData.data).map(([_, locations]) => ({
  //         locations,
  //         isEditable: true,
  //       }))
  //     );
  //   }
  // }, [inventoryData?.data]);

  const handleLocationChange = (componentId, newLocations) => {
    setComponentInventoryStates((currentStates) =>
      currentStates.map((state) =>
        state.componentId === componentId
          ? { ...state, locations: newLocations }
          : state
      )
    );
  };

  const handleEditableChange = (componentId, editable) => {
    setComponentInventoryStates((currentStates) =>
      currentStates.map((state) =>
        state.componentId === componentId
          ? { ...state, isEditable: editable }
          : state
      )
    );
  };

  const handleSubmit = () => {
    addAllToInventoryMutation.mutate(mutatedComponentLocationsObject);
    setAddAllModalOpen(false);
  };

  const page1Content = isLoading ? (
    <div className="text-center text-gray-500 animate-pulse">Loading...</div>
  ) : isError ? (
    <div>Error: Unable to load data.</div>
  ) : (
    <p>
      Are you sure you want to add all the components in your shopping list to
      your inventory? This will clear your shopping list and sum quantities for
      items already in your inventory (if any).
    </p>
  );

  const page2Content = Object.keys(inventoryData?.data ?? {}).map((componentId, index) => {
  const state = inventoryData.data[componentId]; // Access the corresponding state using the key
  return (
    <InventoryLocationEditor
      key={`${componentId}-${index}`}
      componentId={componentId}
      locations={state.locations}
      isEditable={state.isEditable}
      onLocationChange={handleLocationChange}
      onEditableChange={handleEditableChange}
      setMutatedComponentLocationsObject={setMutatedComponentLocationsObject}
    />
  );
});

  return (
    <MultiPageModal
      open={addAllModalOpen}
      setOpen={setAddAllModalOpen}
      pages={[page1Content, page2Content]}
      pagesTitles={["Add to inventory?", "Add locations?"]}
      onSubmit={handleSubmit}
      submitButtonText="Add"
      type="warning"
    />
  );
};

export default AddAllModal;
