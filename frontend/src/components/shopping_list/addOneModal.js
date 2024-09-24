import React, { useState } from "react";

import InventoryModalContent from "./inventoryModalContent";
import Modal from "../../ui/Modal";
import useAddComponentToInventory from "../../services/useAddComponentToInventory";
import useGetInventoryLocations from "../../services/useGetInventoryLocations";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity";
import { useQueryClient } from "@tanstack/react-query";

const AddOneModal = ({
  component,
  setComponent,
}) => {
  const [locationArray, setLocationArray] = useState([]);
  const queryClient = useQueryClient();
  const {
    data: quantityInInventoryAnon,
    isLoading: isLoadingQuantity,
    isError: isErrorQuantity,
  } = useGetUserAnonymousShoppingListQuantity(component?.id);

  const { addComponentToInventory } = useAddComponentToInventory();

  const {
    data: locations,
    isLoading: isLoadingLocation,
    isError: isErrorLocation,
  } = useGetInventoryLocations(component?.id);

  const locationsData = locations ?? locations?.data ?? [];
  const savedLocationsData = Array.isArray(locationsData)
    ? locationsData.map((item) => ({
        locations: item.location || [],
        quantity: item.quantity,
      }))
    : [];

  const handleAddToInventory = async () => {
    const locationString = locationArray.join(",");
    await addComponentToInventory({
      componentId: component?.id,
      location: locationString,
      quantity: quantityInInventoryAnon,
    });
    setComponent(false); // Close the modal after adding
    // Invalidate and refetch queries
    queryClient.invalidateQueries(["inventory"]);
    queryClient.refetchQueries(["inventory"]);
    queryClient.invalidateQueries(["authenticatedUserHistory"]);
    queryClient.refetchQueries(["authenticatedUserHistory"]);
    queryClient.invalidateQueries(["userShoppingList"]);
    queryClient.refetchQueries(["userShoppingList"]);
  };

  return (
    <Modal
      open={!!component?.id}
      setOpen={setComponent}
      title={"Add to inventory?"}
      submitButtonText={"Add"}
      type="warning"
      onSubmit={handleAddToInventory}
    >
      <div>
        {component?.supplier_item_no ? `Are you sure you want to add ${component?.supplier?.short_name} ${component?.supplier_item_no} to your inventory? This will remove this item from your shopping list.` : `Are you sure you want to add ${component?.description} to your inventory? This will remove this item from your shopping list.`}
      </div>
      <InventoryModalContent 
        isLoadingQuantity={isLoadingQuantity} 
        isErrorQuantity={isErrorQuantity} 
        isLoadingLocation={isLoadingLocation} 
        isErrorLocation={isErrorLocation} 
        component={component}
        locationArray={locationArray}
        setLocationArray={setLocationArray}
        savedLocationsData={savedLocationsData}
      />
    </Modal>
  );
};

export default AddOneModal;
