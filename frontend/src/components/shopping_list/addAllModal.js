import Modal from "../../ui/Modal";
import React, { useState, useEffect } from "react";
import useGetInventoryLocationsMultiple from "../../services/useGetInventoryLocationsMultiple";
import SimpleEditableLocation from "../inventory/SimpleEditableLocation";
import useGetComponentsByIds from "../../services/useGetComponentsByIds"; // Adjust the path as necessary

const InventoryLocationEditor = ({
  componentId,
  locations,
  isEditable,
  onLocationChange,
  onEditableChange,
}) => {
  const { componentsData, componentsAreLoading, componentsAreError } =
    useGetComponentsByIds([componentId]);
  console.log(componentsData);

  if (componentsAreError) {
    return <div>Error fetching data</div>;
  }

  if (componentsAreLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  return (
    <>
      <div className="p-4 mt-4 mb-2 bg-gray-100 rounded-md">
        <h4 className="my-2 text-xs text-slate-500">
          {`${componentsData?.[0]?.description} (${componentsData?.[0]?.supplier.name} ${componentsData?.[0]?.supplier_item_no})`}
        </h4>

        <div key={componentId}>
          <SimpleEditableLocation
            locationArray={locations}
            submitLocationChange={(newLocations) =>
              onLocationChange(componentId, newLocations)
            }
            isEditable={isEditable}
            setIsEditable={(editable) =>
              onEditableChange(componentId, editable)
            }
            showSeparateLocationsWithCommas={false}
          />
        </div>
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
  const [componentInventoryStates, setComponentInventoryStates] = useState([]);
  const { inventoryData, isLoading, isError } =
    useGetInventoryLocationsMultiple(
      userShoppingListData?.aggregatedComponents.map(
        (item) => item.component.id
      )
    );

  useEffect(() => {
    if (inventoryData?.data) {
      // Initialize the state for each location
      setComponentInventoryStates(
        Object.entries(inventoryData.data).map(([componentId, locations]) => ({
          componentId,
          locations,
          isEditable: true,
        }))
      );
    }
  }, [inventoryData?.data]);

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

  return (
    <Modal
      open={addAllModalOpen}
      setOpen={setAddAllModalOpen}
      title="Add to inventory?"
      submitButtonText="Add"
      type="warning"
      onSubmit={() => addAllToInventoryMutation.mutate()}
    >
      {isLoading ? (
        <div className="text-center text-gray-500 animate-pulse">
          Loading...
        </div>
      ) : isError ? (
        <div>Error: {isError.message}</div>
      ) : (
        <>
          <p>
            Are you sure you want to add all the components in your shopping
            list to your inventory? This will clear your shopping list and sum
            quantities for items already in your inventory (if any).
          </p>
          {componentInventoryStates.map((state, index) => (
            <InventoryLocationEditor
              key={`${state.componentId}-${index}`}
              componentId={state.componentId}
              locations={state.locations}
              isEditable={state.isEditable}
              onLocationChange={handleLocationChange}
              onEditableChange={handleEditableChange}
            />
          ))}
        </>
      )}
    </Modal>
  );
};

export default AddAllModal;
