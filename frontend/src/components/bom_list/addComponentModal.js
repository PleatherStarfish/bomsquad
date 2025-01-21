import { Dialog, Transition } from "@headlessui/react";
import Quantity, { Types } from "./quantity";
import React, { Fragment, useCallback, useEffect, useState } from "react";

import Accordion from "../../ui/Accordion";
import Button from "../../ui/Button";
import ForOurSubscribersModal from "../modals/ForOurSubscribersModal";
import LocationsTable from "./locationsTable";
import NumericInput from "react-numeric-input";
import SimpleEditableLocation from "../inventory/SimpleEditableLocation";
import goToSupport from "../../utils/goToSupport";
import useAddOrUpdateUserAnonymousShoppingList from "../../services/useAddOrUpdateUserAnonymousShoppingList";
import useAddOrUpdateUserInventory from "../../services/useAddOrUpdateUserInventory";
import useAddOrUpdateUserShoppingList from "../../services/useAddOrUpdateUserShoppingList";
import useAuthenticatedUser from "../../services/useAuthenticatedUser";
import useGetInventoryLocations from "../../services/useGetInventoryLocations";
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
  hookArgs = undefined,
  quantityRequired,
  componentName,
}) => {
  const [error, setError] = useState();
  const [showForOurSubscribersModal, setShowForOurSubscribersModal] =
    useState(false);
  const [quantity, setQuantity] = useState();
  const [editMode, setEditMode] = useState(false);
  const [locationArray, setlocationArray] = useState("");
  const [isLocationEditable, setIsLocationEditable] = useState(true);

  const { userIsLoading, userIsError } = useAuthenticatedUser();

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

  const { data: locations } = useGetInventoryLocations(componentId);
  const locationsData = locations ?? [];

  // const is_premium = user?.is_premium;

  const handleSubmitQuantity = useCallback(async () => {
  
    try {
      if (type === Types.INVENTORY) {
        await addOrUpdateUserInventory.mutateAsync(
          {
            componentId,
            editMode,
            location: Array.isArray(locationArray) ? locationArray.join(",") : "",
            quantity,
          },
          {
            onError: (error) => {
              setError(`Failed to update inventory: ${error.message}`);
            },
            onSuccess: () => {
              setOpen(false);
            },
          }
        );
      } else if (type === Types.SHOPPING) {
        await addOrUpdateUserShoppingList.mutateAsync(
          {
            componentId,
            ...hookArgs,
            editMode,
            quantity,
          },
          {
            onError: (error) => {
              setError(`Failed to update shopping list: ${error.message}`);
            },
            onSuccess: () => {
              setOpen(false);
            },
          }
        );
      } else if (type === Types.SHOPPING_ANON) {
        await addOrUpdateUserAnonymousShoppingList.mutateAsync(
          {
            componentId,
            editMode,
            quantity,
          },
          {
            onError: (error) => {
              setError(`Failed to update anonymous shopping list: ${error.message}`);
            },
            onSuccess: () => {
              setOpen(false);
            },
          }
        );
      } else {
        console.warn("Unknown type:", type);
      }
    } catch (error) {
      setError(`Unexpected error: ${error.message}`);
    } finally {
      console.log("handleSubmitQuantity finished execution.");
    }
  }, [
    type,
    componentId,
    editMode,
    locationArray,
    quantity,
    hookArgs,
    addOrUpdateUserInventory,
    addOrUpdateUserShoppingList,
    addOrUpdateUserAnonymousShoppingList,
    setOpen,
  ]);
  

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
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  const savedLocationsData = Array.isArray(locationsData)
    ? locationsData.map((item) => ({
        locations: item.location || [],
        quantity: item.quantity,
      }))
    : [];

  return (
    <>
      <Transition.Root as={Fragment} show={open && !showForOurSubscribersModal}>
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
                <Dialog.Panel className="relative px-4 pt-5 pb-4 overflow-hidden text-left transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:w-full sm:p-6 md:max-w-lg">
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
                              hookArgs={
                                hookArgs
                                  ? Object.values(hookArgs)
                                  : [componentId]
                              }
                              replaceZero={false}
                              type={type}
                              useHook={
                                type === Types.INVENTORY
                                  ? useGetUserInventoryQuantity
                                  : type === Types.SHOPPING
                                  ? useGetUserShoppingListQuantity
                                  : useGetUserAnonymousShoppingListQuantity
                              }
                            />
                            {editMode
                              ? `. Edit quantity to be ${quantity}?`
                              : `. Add ${quantity} more?`}
                          </div>
                        )}

                        {editMode ? (
                          <div className="my-6">
                            <label
                              className="block mb-1 font-medium text-gray-700"
                              htmlFor="quantityInput"
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
                                    className="h-8 pl-2 border border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500"
                                    id="quantityInput"
                                    min={1}
                                    onChange={(e) => setQuantity(e)}
                                    type="number"
                                    value={quantity ?? 1}
                                  />
                                </div>
                              </div>
                              <div
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => setEditMode((prev) => !prev)}
                                role="button"
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
                              className="block mb-1 font-medium text-gray-700"
                              htmlFor="quantityInput"
                            >
                              Quantity to add:
                            </label>
                            <div className="flex items-center w-full gap-2">
                              <div>
                                <div className="sm:w-2/5 md:w-1/5">
                                  <NumericInput
                                    className="h-8 pl-2 border border-gray-300 rounded-md focus:border-brandgreen-500 focus:ring-1 focus:ring-brandgreen-500"
                                    id="quantityInput"
                                    min={1}
                                    onChange={(e) => setQuantity(e)}
                                    type="number"
                                    value={quantity ?? 1}
                                  />
                                </div>
                              </div>
                              <div
                                className="text-blue-500 hover:text-blue-700"
                                onClick={() => setEditMode((prev) => !prev)}
                                role="button"
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
                  {type === Types.INVENTORY && (
                    <div className="p-4 mt-4 mb-2 bg-gray-100 rounded-md">
                      <p className="my-2 text-xs text-slate-500">
                        Specify the location where you will store this item in
                        your inventory. Separate locations with commas.
                      </p>
                      <SimpleEditableLocation
                        isEditable={isLocationEditable}
                        locationArray={locationArray}
                        setIsEditable={setIsLocationEditable}
                        showSeparateLocationsWithCommas={false}
                        submitLocationChange={setlocationArray}
                      />
                    </div>
                  )}
                  {type === Types.INVENTORY && savedLocationsData.length > 0 && (
                    <div>
                      <Accordion title={`Your inventory locations for ${componentName}`}>
                        <div className="p-4 rounded-md bg-blue-50">
                          <p className="mb-4 text-xs text-slate-500">
                            It looks like you already have this component in
                            your inventory. Click to select a pre-existing
                            location.
                          </p>
                          <LocationsTable
                            data={savedLocationsData}
                            onRowClicked={(row) => {
                              setlocationArray(row.locations);
                              setIsLocationEditable(false);
                            }}
                            pointerEvents="pointer-events-none"
                          />
                        </div>
                      </Accordion>
                    </div>
                  )}
                  <div className="flex gap-2 mt-5 sm:mt-4 sm:flex-row-reverse flex-nowrap">
                    <Button
                      onClick={() => {
                        handleSubmitQuantity();
                        
                        // if (
                        //   is_premium ||
                        //   user?.unique_module_ids.length < 3 ||
                        //   user?.unique_module_ids.includes(`${moduleId}`) ||
                        //   moduleId === null
                        // ) {
                        //   handleSubmitQuantity();
                        // } else {
                        //   setShowForOurSubscribersModal(true);
                        // }
                      }}
                      variant="primary"
                    >
                      {editMode ? "Update" : "Add"}
                    </Button>
                    <Button onClick={() => setOpen(false)} variant="muted">
                      Cancel
                    </Button>
                  </div>
                  <div className="bg-red-500">{error}</div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
      <ForOurSubscribersModal
        message="Please become a subscriber to add more than 3 modules to your shopping list."
        onClickCancel={() => setShowForOurSubscribersModal(false)}
        onClickSupport={() => goToSupport()}
        open={showForOurSubscribersModal}
        title="Limit reached: three modules already in shopping list"
      />
    </>
  );
};

export default AddComponentModal;
