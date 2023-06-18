import React, {useState} from "react";

import Alert from "../../ui/Alert";
import BackButton from "../../ui/BackButton";
import Button from "../../ui/Button";
import { DateTime } from "luxon";
import ListSlice from "../shopping_list/listSlice";
import Modal from "../../ui/Modal";
import useDeleteArchivedShoppingList from "../../services/useDeleteArchivedShoppingList";
import useGetArchivedShoppingLists from "../../services/useGetUserArchivedShoppingLists";

const SavedLists = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const {
    archivedShoppingLists,
    archivedShoppingListsLoading,
    archivedShoppingListsError,
    archivedShoppingListsErrorMessage,
  } = useGetArchivedShoppingLists();

  const deleteArchivedShoppingList = useDeleteArchivedShoppingList();

  const handleDelete = (timestamp) => {
    setSelectedTimestamp(timestamp);
    setDeleteModalOpen(true);
  };

  if (archivedShoppingListsLoading) {
    return (
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        Loading...
      </div>
    );
  }

  if (archivedShoppingListsError) {
    return (
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        {archivedShoppingListsErrorMessage?.message}
      </div>
    );
  }

  console.log(archivedShoppingLists)

  return (
    <>
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        <BackButton prevPageName="Account" />
        <h1 className="mt-5 mb-12 text-3xl font-bold text-gray-700">
          Saved Lists
        </h1>
        {archivedShoppingLists.length ? (
          archivedShoppingLists.map((value, index) => {
            return (
              <div key={index} className="flex flex-col justify-center mt-4 mb-8">
                <div className="flex justify-between py-4">
                  <div className="flex flex-col justify-between gap-2">
                    <h2 className="text-xl font-bold text-gray-700">
                      {value?.notes || DateTime.fromISO(value?.time_saved).toLocaleString(
                        DateTime.DATETIME_FULL
                      )}
                    </h2>
                    {value?.notes && <h3 className="text-sm text-gray-400 font-display">{DateTime.fromISO(value?.time_saved).toLocaleString(DateTime.DATETIME_FULL)}</h3>}
                  </div>
                  <div className="flex justify-between gap-3">
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(value.time_saved)}
                    >
                      Delete
                    </Button>
                    <Button variant="primary">Copy to shopping list</Button>
                  </div>
                </div>
                <div className="flex w-full p-8 rounded-md flex-nowrap bg-gray-50">
                  {[
                    { name: "", data: [] },
                    ...value.groupedByModule
                  ].map((item, index) => {
                    const moduleSlug = Object.values(item.data)?.[0]?.[0]?.module
                      ?.slug;
                    const moduleId = Object.values(item.data)?.[0]?.[0]?.module
                      ?.id;
                    return (
                      <ListSlice
                        key={item.name}
                        name={item.name}
                        slug={moduleSlug}
                        moduleId={moduleId}
                        index={index}
                        allModulesData={value.groupedByModule}
                        componentsInModule={item.data}
                        aggregatedComponents={value?.aggregatedComponents}
                        componentsAreLoading={archivedShoppingListsLoading}
                        backgroundColor="#f9fafb"
                        displayTotals={false}
                        hideInteraction
                      />
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <Alert variant="transparent" centered>
            <span>There are no saved shopping lists.</span>
          </Alert>
        )}
      </div>
      <Modal
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        title={`Delete ${DateTime.fromISO(selectedTimestamp).toLocaleString(
          DateTime.DATETIME_FULL
        )}?`}
        submitButtonText={"Delete"}
        type="danger"
        onSubmit={() => deleteArchivedShoppingList.mutate({timestamp: selectedTimestamp})}
      >
        {`Are you sure you want to delete this list from your saved lists?`}
      </Modal>
    </>
  );
};

export default SavedLists;
