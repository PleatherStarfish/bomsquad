import React, { useState } from "react";

import MultiPageModal from "../../ui/MultiPageModal";
import UniqueComponentIdsList from "./uniqueComponentIdsList";
import useAddAllToInventoryMutation from "../../services/useAddAllToInventoryMutation";

// Define the props for the AddAllModal component.
interface AddAllModalProps {
  addAllModalOpen: boolean;
  setAddAllModalOpen: (open: boolean) => void;
}

// Define a type for the location arrays.
// Adjust the type of the array items as needed.
type LocationArrays = Record<string, string[]>;

const AddAllModal: React.FC<AddAllModalProps> = ({
  addAllModalOpen,
  setAddAllModalOpen,
}) => {
  const { addAllToInventory, isPending } = useAddAllToInventoryMutation();

  // Initialize the state with an empty object typed as LocationArrays.
  const [locationArrays, setLocationArrays] = useState<LocationArrays>({});

  // Update a specific location array for a given component.
  const updateLocationArray = (
    componentId: string,
    newLocationArray: string[]
  ): void => {
    setLocationArrays((prev) => ({
      ...prev,
      [componentId]: newLocationArray,
    }));
  };

  // Handle form submission.
  const handleSubmit = async (): Promise<void> => {
    await addAllToInventory(locationArrays);
  };

  const page1Content = (
    <p>
      Are you sure you want to add all the components in your shopping list to
      your inventory? This will clear your shopping list and sum quantities for
      items already in your inventory (if any).
    </p>
  );

  const page2Content = (
    <UniqueComponentIdsList
      locationArrays={locationArrays}
      setLocationArrays={updateLocationArray}
    />
  );

  return (
    <MultiPageModal
      disabled={isPending}
      onSubmit={handleSubmit}
      open={addAllModalOpen}
      pages={[page1Content, page2Content]}
      pagesTitles={["Add to inventory?", "Add locations?"]}
      setOpen={setAddAllModalOpen}
      submitButtonText="Add"
      type="warning"
    />
  );
};

export default AddAllModal;
