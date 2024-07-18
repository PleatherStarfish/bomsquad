import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import React, {useState} from "react";

import Alert from "../../ui/Alert";
import BackButton from "../../ui/BackButton";
import Button from "../../ui/Button";
import { DateTime } from "luxon";
import ForOurSubscribersModal from "../modals/ForOurSubscribersModal";
import ListSlice from "../shopping_list/listSlice";
import Modal from "../../ui/Modal";
import goToSupport from "../../utils/goToSupport";
import useAddArchivedListToShoppingList from '../../services/useAddArchivedListToShoppingList';
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useDeleteArchivedShoppingList from "../../services/useDeleteArchivedShoppingList";
import useGetArchivedShoppingLists from "../../services/useGetUserArchivedShoppingLists";
import { useNavigate } from 'react-router-dom';

const SavedLists = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addToShoppingListModalOpen, setAddToShoppingListModalOpen] = useState(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const {
    archivedShoppingLists,
    archivedShoppingListsLoading,
    archivedShoppingListsError,
    archivedShoppingListsErrorMessage,
  } = useGetArchivedShoppingLists();
  
  const navigate = useNavigate();

  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  const deleteArchivedShoppingList = useDeleteArchivedShoppingList();
  const addArchivedListToShoppingList = useAddArchivedListToShoppingList();

  const handleAddArchivedList = (timestamp, title) => {
    setSelectedTimestamp(timestamp);
    setSelectedTitle(title)
    setAddToShoppingListModalOpen(true);
};

  const handleDelete = (timestamp, title) => {
    setSelectedTimestamp(timestamp);
    setSelectedTitle(title)
    setDeleteModalOpen(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  if (archivedShoppingListsLoading || userIsLoading) {
    return (
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48 animate-pulse">
        Loading...
      </div>
    );
  }

  if (archivedShoppingListsError || userIsError) {
    return (
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        {archivedShoppingListsErrorMessage?.message}
      </div>
    );
  }

  const sortedArchivedShoppingLists = [...archivedShoppingLists].sort((a, b) => {
    const dateA = new Date(a.time_saved);
    const dateB = new Date(b.time_saved);
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return (
    <>
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        <BackButton prevPageName="Account" />
        <h1 className="mt-5 mb-12 text-3xl font-bold text-gray-700">
          Saved Lists
        </h1>
        {!!sortedArchivedShoppingLists.length && 
          <div className="flex justify-end w-full">
            <Button variant="secondary" onClick={toggleSortOrder} className="flex items-center">
              {sortOrder === "desc" ? (
                <div className="flex flex-nowrap"><span>Sort ascending</span><ChevronDownIcon className="w-5 h-5 ml-1" /></div>
              ) : (
                <div className="flex flex-nowrap"><span>Sort descending</span><ChevronUpIcon className="w-5 h-5 ml-1" /></div>
              )}
            </Button>
          </div>
        }
        {sortedArchivedShoppingLists.length ? (
          sortedArchivedShoppingLists.map((value, index) => {
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
                      onClick={() => handleDelete(value.time_saved, value?.notes)}
                    >
                      Delete
                    </Button>
                    <Button variant="primary" onClick={() => handleAddArchivedList(value.time_saved, value?.notes)}>Copy to shopping list</Button>
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
        title={`Delete ${selectedTitle || DateTime.fromISO(selectedTimestamp).toLocaleString(
          DateTime.DATETIME_FULL
        )}?`}
        submitButtonText={"Delete"}
        type="danger"
        onSubmit={() => deleteArchivedShoppingList.mutate({timestamp: selectedTimestamp})}
      >
        {`Are you sure you want to delete this list from your saved lists?`}
      </Modal>
      <Modal
        open={addToShoppingListModalOpen}
        setOpen={setAddToShoppingListModalOpen}
        title={`Add ${selectedTitle || DateTime.fromISO(selectedTimestamp).toLocaleString(
          DateTime.DATETIME_FULL
        )} to shopping list?`}
        submitButtonText={"Add"}
        type="warning"
        onSubmit={() => addArchivedListToShoppingList({timestamp: selectedTimestamp})}
      >
        {`Are you sure you want to add this to your shopping list? This action can not be automatically reversed.`}
      </Modal>
      <ForOurSubscribersModal 
        open={!user.is_premium} 
        title="This is a feature for our subscribers" 
        message="BOM Squad depends on our the support of our subscribers to keep our servers online. Please help support the project and get access to version history." 
        onClickSupport={() => goToSupport()} 
        onClickCancel={() => navigate(-1)} />
    </>
  );
};

export default SavedLists;
