import { Dialog, Transition } from "@headlessui/react";
import Quantity, { Types } from "./quantity";
import React, { useEffect, useState } from "react";

import Button from "../../ui/Button";
import ForOurSubscribersModal from "../modals/ForOurSubscribersModal";
import { Fragment } from "react";
import NumericInput from "react-numeric-input";
import goToSupport from "../../utils/goToSupport";
import useAddOrUpdateUserAnonymousShoppingList from "../../services/useAddOrUpdateUserAnonymousShoppingList";
import useAddOrUpdateUserInventory from "../../services/useAddOrUpdateUserInventory";
import useAddOrUpdateUserShoppingList from "../../services/useAddOrUpdateUserShoppingList";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useGetUserAnonymousShoppingListQuantity from "../../services/useGetUserAnonymousShoppingListQuantity";
import useGetUserInventoryQuantity from "../../services/useGetUserInventoryQuantity";
import useGetUserShoppingListQuantity from "../../services/useGetUserShoppingListQuantity";

const AddComponentModal = ({
  open,
  setOpen,
  title,
  text,
  type,
  componentId,
  moduleId,
  hookArgs = undefined,
  quantityRequired,
}) => {
  const [showForOurSubscribersModal, setShowForOurSubscribersModal] = useState(
    false
  );
  const [quantity, setQuantity] = useState();
  const [editMode, setEditMode] = useState(false);

  const { user, userIsLoading, userIsError } = useAuthenticatedUser();

  const addOrUpdateUserInventory = useAddOrUpdateUserInventory();

  const addOrUpdateUserShoppingList = useAddOrUpdateUserShoppingList();
  const addOrUpdateUserAnonymousShoppingList =
    useAddOrUpdateUserAnonymousShoppingList();

  const { data: quantityInInventory } =
    useGetUserInventoryQuantity(componentId);

  const { data: quantityShoppingListAnon } =
    useGetUserAnonymousShoppingListQuantity(componentId);

  const { data: quantityInShoppingList } =
    hookArgs !== undefined
      ? useGetUserShoppingListQuantity(...Object.values(hookArgs))
      : { data: undefined };

  const is_premium = user?.is_premium;

  const handleSubmitQuantity = async () => {
    try {
      if (type === Types.INVENTORY) {
        await addOrUpdateUserInventory({
          componentId,
          quantity,
          editMode,
        });
      } else if (type === Types.SHOPPING) {
        await addOrUpdateUserShoppingList({
          componentId,
          ...hookArgs,
          quantity,
          editMode,
        });
      } else if (type === Types.SHOPPING_ANON) {
        await addOrUpdateUserAnonymousShoppingList({
          componentId,
          quantity,
          editMode
        });
      }
    } catch (error) {
      console.error("Failed to update quantity", error);
    }
    setOpen(false);
  };

  useEffect(() => {
    let newQuantity = parseInt(quantityRequired);

    if (editMode) {
      if (type === Types.SHOPPING) {
        newQuantity = parseInt(quantityInShoppingList);
      } else if (type === Types.SHOPPING_ANON) {
        newQuantity = parseInt(quantityShoppingListAnon);
      } else if (type === Types.INVENTORY) {
        newQuantity = parseInt(quantityInInventory);
      }
    }

    setQuantity(newQuantity);
  }, [quantityRequired, editMode, type]);

  const displayInventoryAlert =
    (!!quantityInInventory && type === Types.INVENTORY) ||
    (!!quantityShoppingListAnon && type === Types.SHOPPING_ANON) ||
    (!!quantityInShoppingList && type === Types.SHOPPING);

  if (userIsError) {
    return <div>Error loading user</div>;
  }

  if (userIsLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }

  return (
    <>
      <Transition.Root show={open && !showForOurSubscribersModal} as={Fragment}>
        <Dialog as="div" className="relative" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-full p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:p-6 md:max-w-md">
                  <div>
                    <div className="mt-3 text-center sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-base font-semibold leading-6 text-gray-900"
                      >
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">
                        {text && (
                          <p className="pt-3 text-sm text-gray-500">{text}</p>
                        )}
                        {displayInventoryAlert && (
                          <div className="pt-3 text-gray-700">
                            Your{" "}
                            {type === "shopping_anon" ? "shopping list" : type}{" "}
                            already contains{" "}
                            <Quantity
                              type={type}
                              useHook={
                                type === Types.INVENTORY
                                  ? useGetUserInventoryQuantity
                                  : type === Types.SHOPPING
                                  ? useGetUserShoppingListQuantity
                                  : useGetUserAnonymousShoppingListQuantity
                              }
                              hookArgs={
                                hookArgs ? Object.values(hookArgs) : [componentId]
                              }
                              replaceZero={false}
                            />
                            {editMode
                              ? `. Edit quantity to be ${quantity}?`
                              : `. Add ${quantity} more?`}
                          </div>
                        )}

                        {editMode ? (
                          <div className="my-6">
                            <label
                              htmlFor="quantityInput"
                              className="block mb-1 font-medium text-gray-700"
                            >
                              {`Edit ${
                                type === Types.INVENTORY
                                  ? "inventory"
                                  : "shopping list"
                              } quantity:`}
                            </label>
                            <div className="flex items-center w-full gap-2">
                              <div>
                                <div className="sm:w-2/5 md:w-1/5">
                                  <NumericInput
                                    id="quantityInput"
                                    type="number"
                                    min={1}
                                    value={quantity ?? 1}
                                    onChange={(e) => setQuantity(e)}
                                    className="h-8 pl-2 border border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500"
                                  />
                                </div>
                              </div>
                              <div
                                role="button"
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => setEditMode((prev) => !prev)}
                              >
                                {`or add to ${
                                  type === Types.INVENTORY
                                    ? "inventory"
                                    : "shopping list"
                                }`}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="my-6">
                            <label
                              htmlFor="quantityInput"
                              className="block mb-1 font-medium text-gray-700"
                            >
                              Quantity to add:
                            </label>
                            <div className="flex items-center w-full gap-2">
                              <div>
                                <div className="sm:w-2/5 md:w-1/5">
                                  <NumericInput
                                    id="quantityInput"
                                    type="number"
                                    min={1}
                                    value={quantity ?? 1}
                                    onChange={(e) => setQuantity(e)}
                                    className="h-8 pl-2 border border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500"
                                  />
                                </div>
                              </div>
                              <div
                                role="button"
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => setEditMode((prev) => !prev)}
                              >
                                {`or edit ${
                                  type === Types.INVENTORY
                                    ? "inventory"
                                    : "shopping list"
                                }`}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 sm:mt-4 sm:flex-row-reverse flex-nowrap">
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (is_premium || user?.unique_module_ids.length < 3 || user?.unique_module_ids.includes(`${moduleId}`) || moduleId === null) {
                          handleSubmitQuantity();
                        } else {
                          setShowForOurSubscribersModal(true);
                        }
                      }}
                    >
                      {editMode ? "Update" : "Add"}
                    </Button>
                    <Button variant="muted" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <ForOurSubscribersModal 
        open={showForOurSubscribersModal} 
        title="Limit reached: three modules already in shopping list" 
        message="Please become a subscriber to add more than 3 modules to your shopping list." 
        onClickSupport={() => goToSupport()} 
        onClickCancel={() => setShowForOurSubscribersModal(false)} />
    </>

  );
};

export default AddComponentModal;
