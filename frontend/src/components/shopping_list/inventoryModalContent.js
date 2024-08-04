import Accordion from "../../ui/Accordion";
import LocationsTable from "../bom_list/locationsTable";
import React from "react";
import SimpleEditableLocation from "../inventory/SimpleEditableLocation";

const InventoryModalContent = ({
  isLoadingQuantity,
  isErrorQuantity,
  isLoadingLocation,
  isErrorLocation,
  component,
  locationArray,
  setLocationArray,
  savedLocationsData,
  showComponentHeading = false,
}) => {
  return isLoadingQuantity || isLoadingLocation ? (
    <div className="text-center text-gray-500 animate-pulse">
      Loading...
    </div>
  ) : isErrorQuantity || isErrorLocation ? (
    <div>Error: {isErrorQuantity?.message || isErrorLocation?.message}</div>
  ) : (
      <div className="p-4 mt-4 mb-2 bg-gray-100 rounded-md">
        {showComponentHeading && <h2>{component?.[0]?.supplier_item_no ? `${component?.[0].supplier?.short_name} ${component?.[0]?.supplier_item_no}` : component?.[0]?.description}</h2>}
        <p className="my-2 text-xs text-slate-500">
          Specify the location where you will store this item in your inventory. Separate locations with commas.
        </p>
        <SimpleEditableLocation
          locationArray={locationArray}
          submitLocationChange={setLocationArray}
          showSeparateLocationsWithCommas={false}
        />
        {savedLocationsData.length > 0 && (
        <div className="mt-4">
          <Accordion
            backgroundColor="bg-blue-100"
            title={component?.[0]?.supplier_item_no ? `Your inventory locations for ${component?.[0].supplier?.short_name} ${component?.[0]?.supplier_item_no}` : `Your inventory locations for ${component?.[0].description}`}
          >
            <div className="p-4 bg-blue-100 rounded-md">
              <p className="mb-4 text-xs text-slate-500">
                It looks like you already have this component in your inventory. Click to select a pre-existing location.
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
      </div>
  );
};

export default InventoryModalContent;
