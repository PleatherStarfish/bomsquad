import InventoryModalContent from "./inventoryModalContent";
import React from 'react';
import useGetAllUniqueComponentIds from "../../services/useGetAllUniqueComponentIds";
import useGetComponentsByIds from "../../services/useGetComponentsByIds";
import useGetInventoryLocations from "../../services/useGetInventoryLocations";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity"

const ComponentIdItem = ({ componentId, locationArrays, setLocationArrays }) => {

  const { componentsData, isLoading: componentsAreLoading, isError: componentsAreError } = useGetComponentsByIds([componentId]);
  const { data: locations, isLoading: isLoadingLocation, isError: isErrorLocation } = useGetInventoryLocations(componentId);

  const { isLoading: isLoadingQuantity, isError: isErrorQuantity } = useGetUserAnonymousShoppingListQuantity(componentId);

  if (componentsAreLoading || isLoadingLocation || isLoadingQuantity) {
    return <div className="text-center animate-pulse">Loading...</div>;
  }

  if (componentsAreError || isErrorLocation || isErrorQuantity || !componentsData?.length) {
    return <div>Error: Unable to load data.</div>;
  }

  // Safeguard map with an array check
  const savedLocationsData = Array.isArray(locations) ? locations.map(item => ({
    locations: item.location || [],
    quantity: item.quantity,
  })) : [];

  return (
      <InventoryModalContent 
        component={componentsData} 
        isErrorLocation={isErrorLocation} 
        isErrorQuantity={isErrorQuantity} 
        isLoadingLocation={isLoadingLocation} 
        isLoadingQuantity={isLoadingQuantity} 
        locationArray={locationArrays}
        savedLocationsData={savedLocationsData}
        setLocationArray={(newLocationArray) => setLocationArrays(componentId, newLocationArray)}
        showComponentHeading
      />
  );
};

const UniqueComponentIdsList = ({locationArrays, setLocationArrays}) => {
  const { uniqueComponentIds, isLoading, isError } =
    useGetAllUniqueComponentIds();

  if (isLoading) {
    return <div className="text-center animate-pulse">Loading...</div>;
  }

  if (isError) {
    return <div>Error: Unable to load data.</div>;
  }

  return (
    <div className="overflow-auto max-h-[400px]">
      {uniqueComponentIds &&
        uniqueComponentIds.map((componentId) => (
          <ComponentIdItem componentId={componentId} key={componentId} locationArrays={locationArrays[componentId] || []} setLocationArrays={setLocationArrays} />
        ))}
    </div>
  );
};

export default UniqueComponentIdsList;
