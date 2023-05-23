import { FolderPlusIcon, HeartIcon } from "@heroicons/react/24/outline";

import Alert from "../ui/Alert";
import Button from "../ui/Button";
import ListSlice from "./shopping_list/listSlice";
import Modal from "../ui/Modal"
import React from "react";
import _ from "lodash";
import useAddAllToInventoryMutation from "../services/useAddAllToInventoryMutation";
import useGetUserShoppingList from "../services/useGetUserShoppingList";

const ShoppingList = () => {
  const [addAllModalOpen, setAddAllModalOpen] = React.useState(false);
  const addAllToInventoryMutation = useAddAllToInventoryMutation();
  const {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  } = useGetUserShoppingList();

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
      {!!userShoppingListData?.groupedByModule.length ? (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end w-full gap-2 flex-nowrap">
            <Button
              version="primary"
              Icon={HeartIcon}
              onClick={() => setAddAllModalOpen(true)}
            >
              Save list as favorite
            </Button>
            <Button
              version="primary"
              Icon={FolderPlusIcon}
              onClick={() => setAddAllModalOpen(true)}
            >
              Add all to inventory
            </Button>
          </div>
          <div className="flex justify-start">
            {[
              { name: "", data: [] },
              ...userShoppingListData.groupedByModule,
              { name: "TOTAL", data: [] },
            ].map((value, index) => {
              console.log("userShoppingListData", userShoppingListData);
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
