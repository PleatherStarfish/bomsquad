import { CheckIcon, FolderPlusIcon, HeartIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import { Link } from "react-router-dom";
import ListSlice from "./shopping_list/listSlice";
import Modal from "../ui/Modal";
import Notification from "../ui/Notification";
import _ from "lodash";
import useAddAllToInventoryMutation from "../services/useAddAllToInventoryMutation";
import useArchiveShoppingListMutation from "../services/useArchiveUserSavedShoppingList";
import useGetUserShoppingList from "../services/useGetUserShoppingList";

const ShoppingList = () => {
  const [addAllModalOpen, setAddAllModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [saveListClicked, setSaveListClicked] = useState(false);

  const addAllToInventoryMutation = useAddAllToInventoryMutation();
  const {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  } = useGetUserShoppingList();

  const archiveShoppingListMutation = useArchiveShoppingListMutation();
  const debouncedArchiveMutation = useCallback(
    _.debounce(() => {
      archiveShoppingListMutation.mutate();
    }, 1000),
    []
  );

  useEffect(() => {
    if (archiveShoppingListMutation.isSuccess) {
      setShowNotification(true);
    }
  }, [archiveShoppingListMutation.isSuccess]);

  useEffect(() => {
    if (saveListClicked) {
      const timer = setTimeout(() => {
        setSaveListClicked(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [saveListClicked]);

  if (userShoppingListIsError) {
    return <div>Error fetching data</div>;
  }

  if (userShoppingListIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  return (
    <>
      <Notification
        show={showNotification}
        setShow={setShowNotification}
        title="Success!"
        message="Your shopping list was successfully saved."
      />
      {!!userShoppingListData?.groupedByModule.length ? (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end w-full gap-2 flex-nowrap">
            <Link to="saved-lists/">
              <Button
                version="primary"
              >
                Go to saved lists
              </Button>
            </Link>
            <Button
              version="primary"
              Icon={saveListClicked ? CheckIcon : HeartIcon}
              onClick={() => {
                setSaveListClicked(true);
                debouncedArchiveMutation();
              }}
            >
              Save shopping list
            </Button>
            <Button
              version="primary"
              Icon={FolderPlusIcon}
              onClick={() => setAddAllModalOpen(true)}
            >
              Add all to inventory
            </Button>
          </div>
          <div className="flex justify-start w-full">
            {[
              { name: "", data: [] },
              ...userShoppingListData.groupedByModule,
              { name: "TOTAL QUANTITY", data: [] },
              { name: "TOTAL PRICE", data: [] },
            ].map((value, index) => {
              const moduleSlug = Object.values(value.data)?.[0]?.[0]?.module
                ?.slug;
              const moduleId = Object.values(value.data)?.[0]?.[0]?.module?.id;
              return (
                <ListSlice
                  key={value.name}
                  name={value.name}
                  slug={moduleSlug}
                  moduleId={moduleId}
                  index={index}
                  allModulesData={userShoppingListData.groupedByModule}
                  componentsInModule={value.data}
                  aggregatedComponents={
                    userShoppingListData?.aggregatedComponents
                  }
                  componentsAreLoading={userShoppingListIsLoading}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <Alert variant="transparent" centered>
          <span>
            There are no components in your shopping list.{" "}
            <a className="text-blue-500" href="/components">
              Add components.
            </a>
          </span>
        </Alert>
      )}
      <Modal
        open={addAllModalOpen}
        setOpen={setAddAllModalOpen}
        title={"Add to inventory?"}
        submitButtonText={"Add"}
        type="warning"
        onSubmit={() => addAllToInventoryMutation.mutate()}
      >
        {`Are you sure you want to add all the components in your shopping list to your inventory? This will clear your shopping list and sum quantities for items already in your inventory (if any).`}
      </Modal>
    </>
  );
};

export default ShoppingList;
