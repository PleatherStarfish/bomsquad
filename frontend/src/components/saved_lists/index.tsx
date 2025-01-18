import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";

import Alert from "../../ui/Alert";
import BackButton from "../../ui/BackButton";
import Button from "../../ui/Button";
import { DateTime } from "luxon";
import ForOurSubscribersModal from "../modals/ForOurSubscribersModal";
import ListSlice from "../shopping_list/listSlice";
import Modal from "../../ui/Modal";
import goToSupport from "../../utils/goToSupport";
import useAddArchivedListToShoppingList from "../../services/useAddArchivedListToShoppingList";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useDeleteArchivedShoppingList from "../../services/useDeleteArchivedShoppingList";
import useGetArchivedShoppingLists from "../../services/useGetUserArchivedShoppingLists";
import { useNavigate } from "react-router-dom";

const SavedLists: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [addToShoppingListModalOpen, setAddToShoppingListModalOpen] = useState<boolean>(false);
  const [selectedTimestamp, setSelectedTimestamp] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

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

  const handleAddArchivedList = (timestamp: string, title?: string) => {
    setSelectedTimestamp(timestamp);
    setSelectedTitle(title || null);
    setAddToShoppingListModalOpen(true);
  };

  const handleDelete = (timestamp: string, title?: string) => {
    setSelectedTimestamp(timestamp);
    setSelectedTitle(title || null);
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
        {archivedShoppingListsErrorMessage?.message || "An error occurred."}
      </div>
    );
  }

  const sortedArchivedShoppingLists = [...(archivedShoppingLists || [])].sort(
    (a: {
      time_saved: string;
      groupedByModule: {
        name: string;
        moduleId: any;
        data: Record<string, any[]>;
      }[];
      aggregatedComponents: any[];
      notes: any;
    }, 
    b: {
      time_saved: string;
      groupedByModule: {
        name: string;
        moduleId: any;
        data: Record<string, any[]>;
      }[];
      aggregatedComponents: any[];
      notes: any;
    }) => {
      const dateA = new Date(a.time_saved);
      const dateB = new Date(b.time_saved);
      return sortOrder === "desc"
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    }
  );

  return (
    <>
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        <BackButton prevPageName="Account" />
        <h1 className="mt-5 mb-12 text-3xl font-bold text-gray-700">Saved Lists</h1>
        {!!sortedArchivedShoppingLists.length && (
          <div className="flex justify-end w-full">
            <Button classNames="flex items-center" onClick={toggleSortOrder} variant="none">
              {sortOrder === "desc" ? (
                <div className="flex flex-nowrap">
                  <span>Sort ascending</span>
                  <ChevronDownIcon className="w-5 h-5 ml-1" />
                </div>
              ) : (
                <div className="flex flex-nowrap">
                  <span>Sort descending</span>
                  <ChevronUpIcon className="w-5 h-5 ml-1" />
                </div>
              )}
            </Button>
          </div>
        )}
        {sortedArchivedShoppingLists.length ? (
          sortedArchivedShoppingLists.map((value, index) => (
            <div className="flex flex-col justify-center mt-4 mb-8" key={index}>
              <div className="flex justify-between py-4">
                <div className="flex flex-col justify-between gap-2">
                  <h2 className="text-xl font-bold text-gray-700">
                    {value.notes ||
                      DateTime.fromISO(value.time_saved).toLocaleString(DateTime.DATETIME_FULL)}
                  </h2>
                  {value.notes && (
                    <h3 className="text-sm text-gray-400 font-display">
                      {DateTime.fromISO(value.time_saved).toLocaleString(DateTime.DATETIME_FULL)}
                    </h3>
                  )}
                </div>
                <div className="flex justify-between gap-3">
                  <Button onClick={() => handleDelete(value.time_saved, value.notes)} variant="danger">
                    Delete
                  </Button>
                  <Button onClick={() => handleAddArchivedList(value.time_saved, value.notes)} variant="primary">
                    Copy to shopping list
                  </Button>
                </div>
              </div>
              <div className="flex justify-center w-full p-8 rounded-md flex-nowrap bg-gray-50">
                {[{ data: [], name: "" }, ...value.groupedByModule].map((item, index) => {
                  if (!item.data || item.data.length === 0) {
                    return null;
                  }

                  const moduleData = item.data && Object.values(item.data as Record<string, any>)?.[0]?.[0]?.module ? Object.values(item.data as Record<string, any>)[0][0].module : {};
                  const moduleSlug = moduleData?.slug || "";
                  const moduleId = moduleData?.id || "";

                  return (
                    <ListSlice
                      aggregatedComponents={value.aggregatedComponents}
                      allModulesData={value.groupedByModule}
                      backgroundColor="#f9fafb"
                      componentsAreLoading={archivedShoppingListsLoading}
                      componentsInModule={Array.isArray(item.data) ? {} : item.data}
                      displayTotals={false}
                      hideInteraction
                      index={index}
                      key={item.name}
                      moduleId={moduleId}
                      name={item.name}
                      slug={moduleSlug}
                    />
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <Alert align="around" variant="transparent">
            <span>There are no saved shopping lists.</span>
          </Alert>
        )}
      </div>
      <Modal
        onSubmit={() => deleteArchivedShoppingList.mutate({ timestamp: selectedTimestamp! })}
        open={deleteModalOpen}
        setOpen={setDeleteModalOpen}
        submitButtonText={"Delete"}
        title={`Delete ${
          selectedTitle ||
          DateTime.fromISO(selectedTimestamp!).toLocaleString(DateTime.DATETIME_FULL)
        }?`}
        type="danger"
      >
        {`Are you sure you want to delete this list from your saved lists?`}
      </Modal>
      <Modal
        onSubmit={() => addArchivedListToShoppingList({ timestamp: selectedTimestamp! })}
        open={addToShoppingListModalOpen}
        setOpen={setAddToShoppingListModalOpen}
        submitButtonText={"Add"}
        title={`Add ${
          selectedTitle ||
          DateTime.fromISO(selectedTimestamp!).toLocaleString(DateTime.DATETIME_FULL)
        } to shopping list?`}
        type="warning"
      >
        {`Are you sure you want to add this to your shopping list? This action cannot be automatically reversed.`}
      </Modal>
      <ForOurSubscribersModal
        message="BOM Squad depends on the support of our subscribers to keep our servers online. Please help support the project and get access to version history."
        onClickCancel={() => navigate(-1)}
        onClickSupport={() => goToSupport()}
        open={!user?.is_premium}
        title="This is a feature for our subscribers"
      />
    </>
  );
};

export default SavedLists;
