import React, { useState } from "react";

import MultiPageModal from "../../ui/MultiPageModal";
import UniqueComponentIdsList from './uniqueComponentIdsList';
import useAddAllToInventoryMutation from "../../services/useAddAllToInventoryMutation";

const AddAllModal = ({
  addAllModalOpen,
  setAddAllModalOpen,
}) => {
  const { addAllToInventory, isPending } = useAddAllToInventoryMutation();
  const [locationArrays, setLocationArrays] = useState({});

  const updateLocationArray = (componentId, newLocationArray) => {
    setLocationArrays(prev => ({
      ...prev,
      [componentId]: newLocationArray,
    }));
  };

  const handleSubmit = async () => {
    await addAllToInventory(locationArrays);
  }

  const page1Content = 
    <p>
      Are you sure you want to add all the components in your shopping list to
      your inventory? This will clear your shopping list and sum quantities for
      items already in your inventory (if any).
    </p>


  const page2Content = <UniqueComponentIdsList locationArrays={locationArrays} setLocationArrays={updateLocationArray} />;

  return (
    <MultiPageModal
      open={addAllModalOpen}
      setOpen={setAddAllModalOpen}
      pages={[page1Content, page2Content]}
      pagesTitles={["Add to inventory?", "Add locations?"]}
      onSubmit={handleSubmit}
      submitButtonText="Add"
      disabled={isPending}
      type="warning"
    />
  );
};

export default AddAllModal;
