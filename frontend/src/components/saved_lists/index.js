import Button from "../../ui/Button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { DateTime } from 'luxon';
import { Link } from "react-router-dom";
import ListSlice from "../shopping_list/listSlice";
import React from "react";
import useDeleteArchivedShoppingList from "../../services/useDeleteArchivedShoppingList";
import useGetArchivedShoppingLists from "../../services/useGetUserArchivedShoppingLists";

const SavedLists = () => {
  const { 
    archivedShoppingLists, 
    archivedShoppingListsLoading, 
    archivedShoppingListsError, 
    archivedShoppingListsErrorMessage 
  } = useGetArchivedShoppingLists();

  const deleteArchivedShoppingList = useDeleteArchivedShoppingList();

  const handleDelete = (timestamp) => {
    deleteArchivedShoppingList.mutate({ timestamp });
  };


  if (archivedShoppingListsLoading) {
    return (
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        Loading...
      </div>
    )
  }

  if (archivedShoppingListsError) {
    return (
      <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        {archivedShoppingListsErrorMessage?.message}
      </div>
    );
  }

  return (
    <div className="px-4 py-8 mt-16 mb-12 sm:mt-36 md:px-24 lg:px-48">
        <Link
        to=".."
        relative="path"
        className="flex items-center gap-2 text-gray-400"
      >
        <ChevronLeftIcon className="w-5 h-5" />
        <span>Back to Account</span>
      </Link>
      <h1 className="mt-5 mb-12 text-3xl font-bold text-gray-700">Saved Lists</h1>
      {archivedShoppingLists ? archivedShoppingLists.map((value, index) => {
        return (
          <div key={index} className="flex flex-col justify-center mt-4 mb-8">
            <div className="flex justify-between py-4">
              <h2 className="text-xl font-bold text-gray-700">{DateTime.fromISO(value?.time_saved).toLocaleString(DateTime.DATETIME_FULL)}</h2>
              <div className="flex justify-between gap-4">
                <Button
                  variant="danger"
                  onClick={() => handleDelete(value.time_saved)}
                >
                  Delete
                </Button>
                <Button
                  variant="primary"
                >
                  Copy to shopping list
                </Button>
              </div>
            </div>
            <div className="flex w-full p-8 rounded-md flex-nowrap bg-gray-50">
              {[
                { name: "", data: [] },
                ...value.groupedByModule,
                { name: "TOTAL QUANTITY", data: [] },
                { name: "TOTAL PRICE", data: [] },
              ].map((item, index) => {
                const moduleSlug = Object.values(item.data)?.[0]?.[0]?.module?.slug;
                const moduleId = Object.values(item.data)?.[0]?.[0]?.module?.id;
                return (
                    <ListSlice
                      key={item.name}
                      name={item.name}
                      slug={moduleSlug}
                      moduleId={moduleId}
                      index={index}
                      allModulesData={value.groupedByModule}
                      componentsInModule={item.data}
                      aggregatedComponents={
                        value?.aggregatedComponents
                      }
                      componentsAreLoading={archivedShoppingListsLoading}
                      backgroundColor="#f9fafb"
                      hideInteraction
                    />
                );
              })}
            </div>
          </div>
        )
      }) : <p>No saved lists</p>}
    </div>
  );
};

export default SavedLists;
