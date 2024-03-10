import React, { useState } from "react";

import Accordion from "../../ui/Accordion";
import LocationsTable from "../bom_list/locationsTable";
import Modal from "../../ui/Modal";
import SimpleEditableLocation from "../inventory/SimpleEditableLocation";
import useAddComponentToInventory from "../../services/useAddComponentToInventory";
import useGetInventoryLocations from "../../services/useGetInventoryLocations";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity";

const AddOneModal = ({
  addOneToInventoryModalOpen,
  setAddOneToInventoryModalOpen,
}) => {
  const [locationArray, setLocationArray] = useState([]);
  const {
    data: quantityInInventoryAnon,
    isLoading: isLoadingQuantity,
    isError: isErrorQuantity,
  } = useGetUserAnonymousShoppingListQuantity(addOneToInventoryModalOpen?.id);

  const addComponentToInventory = useAddComponentToInventory();

  const {
    data: locations,
    isLoading: isLoadingLocation,
    isError: isErrorLocation,
  } = useGetInventoryLocations(addOneToInventoryModalOpen?.id);

  const locationsData = locations?.data ?? [];
  const savedLocationsData = Array.isArray(locationsData)
    ? locationsData.map((item) => ({
        locations: item.location || [],
        quantity: item.quantity,
      }))
    : [];

  const handleAddToInventory = () => {
    const locationString = locationArray.join(",");
    addComponentToInventory({
      componentId: addOneToInventoryModalOpen?.id,
      location: locationString,
      quantity: quantityInInventoryAnon,
    });
    setAddOneToInventoryModalOpen(false); // Close the modal after adding
  };

  return (
    <Modal
      open={!!addOneToInventoryModalOpen?.id}
      setOpen={setAddOneToInventoryModalOpen}
      title={"Add to inventory?"}
      submitButtonText={"Add"}
      type="warning"
      onSubmit={handleAddToInventory}
    >
      {isLoadingQuantity || isLoadingLocation ? (
        <div className="text-center text-gray-500 animate-pulse">
          Loading...
        </div>
      ) : isErrorQuantity || isErrorLocation ? (
        <div>Error: {isErrorQuantity.message || isErrorLocation.message}</div>
      ) : (
        <>
          <div>
            {`Are you sure you want to add ${addOneToInventoryModalOpen.supplier?.short_name} ${addOneToInventoryModalOpen.supplier_item_no} to your inventory? This will remove this item from your shopping list.`}
          </div>
          <div className="p-4 mt-4 mb-2 bg-gray-100 rounded-md">
            <p className="my-2 text-xs text-slate-500">
              Specify the location where you will store this item in your
              inventory. Separate locations with commas.
            </p>
            <SimpleEditableLocation
              locationArray={locationArray}
              submitLocationChange={setLocationArray}
              showSeparateLocationsWithCommas={false}
            />
          </div>
          {savedLocationsData.length > 0 && (
            <div>
              <Accordion
                title={`Your inventory locations for ${addOneToInventoryModalOpen.supplier?.short_name} ${addOneToInventoryModalOpen.supplier_item_no}`}
              >
                <div className="p-4 rounded-md bg-blue-50">
                  <p className="mb-4 text-xs text-slate-500">
                    It looks like you already have this component in your
                    inventory. Click to select a pre-existing location.
                  </p>
                  <LocationsTable
                    data={savedLocationsData}
                    onRowClicked={(row) => {
                      setLocationArray(row.locations);
                    }}
                  />
                </div>
              </Accordion>
            </div>
          )}
        </>
      )}
    </Modal>
  );
};

export default AddOneModal;
