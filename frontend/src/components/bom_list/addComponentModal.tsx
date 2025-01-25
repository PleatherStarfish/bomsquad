import { Dialog, Transition } from "@headlessui/react";
import Quantity, { Types } from "./quantity";
import React, { Dispatch, Fragment, useEffect, useState } from "react";

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

type TypesValues = typeof Types[keyof typeof Types];

// Define the prop types for the component
interface AddComponentModalProps {
  open: boolean;
  setOpen: Dispatch<React.SetStateAction<string | undefined>>; // Set row.id or undefined 
  title: string;
  text?: JSX.Element | string;
  type: TypesValues;
  componentPk: string;
  modulePk?: string;
  modulebomlistitemPk?: string;
  quantityRequired: number;
  componentName: string;
}

// Define the type for saved locations
interface SavedLocationData {
  locations: string[];
  quantity: number;
}

const AddComponentModal: React.FC<AddComponentModalProps> = ({
  open,
  setOpen,
  title,
  text,
  type,
  componentPk,
  modulePk,
  modulebomlistitemPk,
  quantityRequired,
  componentName,
}) => {
  const [error, setError] = useState<string | undefined>();
  const [showForOurSubscribersModal, setShowForOurSubscribersModal] =
    useState(false);
  const [quantity, setQuantity] = useState<number | undefined>();
  const [editMode, setEditMode] = useState(false);
  const [locationArray, setlocationArray] = useState<string>("");
  // const [isLocationEditable, setIsLocationEditable] = useState(true);

  const { userIsLoading, userIsError } = useAuthenticatedUser();

  const addOrUpdateUserInventory = useAddOrUpdateUserInventory();
  const addOrUpdateUserShoppingList = useAddOrUpdateUserShoppingList();
  const addOrUpdateUserAnonymousShoppingList =
    useAddOrUpdateUserAnonymousShoppingList();

  const { data: quantityInInventory } =
    useGetUserInventoryQuantity(componentPk);

  const { data: quantityShoppingListAnon } =
    useGetUserAnonymousShoppingListQuantity(componentPk);

    const { data: quantityInShoppingList } = 
    modulebomlistitemPk && modulePk
      ? useGetUserShoppingListQuantity({
          componentPk,
          modulebomlistitemPk,
          // eslint-disable-next-line sort-keys-fix/sort-keys-fix
          modulePk,
          type: "notAnonymous",
        })
      : useGetUserShoppingListQuantity({
          componentPk,
          type: "anonymous"
        });

  const { data: locations } = useGetInventoryLocations(componentPk);
  const locationsData: SavedLocationData[] = locations ?? [];

  const handleSubmitQuantity = async () => {
    console.log("handleSubmitQuantity called with type:", type);
  
    try {
      if (type === Types.INVENTORY) {
        await addOrUpdateUserInventory.mutateAsync(
          {
            componentId: componentPk,
            editMode,
            location: locationArray,
            quantity: quantity ?? 0,
          },
          {
            onError: (error) => {
              if (error instanceof Error) {
                setError(`Failed to update inventory: ${error.message}`);
              } else {
                setError("Failed to update inventory: Unknown error");
              }
            },
            onSuccess: () => {
              console.log("Inventory successfully updated.");
              setOpen(undefined);
            },
          }
        );
      } else if (type === Types.SHOPPING) {
        
        if (!componentPk || !modulePk || !modulebomlistitemPk) {
          console.error("Missing required parameters for updating shopping list.");
          setError("Please ensure all required fields are filled.");
          return;
        }

        await addOrUpdateUserShoppingList.mutateAsync(
          {
            componentId: componentPk,
            module_pk: modulePk,
            modulebomlistitem_pk: modulebomlistitemPk,
            quantity: quantity ?? 0, // Default quantity to 0 if undefined
          },
          {
            onError: (error) => {
              console.error("Error updating shopping list:", error);
              setError(`Failed to update shopping list: ${error.message}`);
            },
            onSuccess: () => {
              console.log("Shopping list successfully updated.");
              setOpen(undefined);
            },
          }
        );
      } else if (type === Types.SHOPPING_ANON) {
        console.log("Updating anonymous shopping list with data:", {
          componentId: componentPk,
          editMode,
          quantity,
        });
        await addOrUpdateUserAnonymousShoppingList.mutateAsync(
          {
            componentId: componentPk,
            editMode,
            quantity: quantity ?? 0,
          },
          {
            onError: (error) => {
              console.error("Error updating anonymous shopping list:", error);
              setError(`Failed to update anonymous shopping list: ${error.message}`);
            },
            onSuccess: () => {
              console.log("Anonymous shopping list successfully updated.");
              setOpen(undefined);
            },
          }
        );
      } else {
        console.warn("Unknown type encountered:", type);
      }
    } catch (error) {
      console.error("Unexpected error in handleSubmitQuantity:", error);
      setError(`Unexpected error: ${error.message}`);
    } finally {
      console.log("handleSubmitQuantity finished execution.");
    }
  };

  useEffect(() => {
    let newQuantity = quantityRequired;

    if (editMode) {
      if (type === Types.SHOPPING) {
        newQuantity = quantityInShoppingList ?? 0;
      } else if (type === Types.SHOPPING_ANON) {
        newQuantity = parseInt(quantityShoppingListAnon);
      } else if (type === Types.INVENTORY) {
        newQuantity = quantityInInventory ?? 0;
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
        locations: item.locations || [],
        quantity: item.quantity,
      }))
    : [];

  return (
    <>
      <Transition.Root as={Fragment} show={open && !showForOurSubscribersModal}>
        <Dialog as="div" className="relative" onClose={() => setOpen(undefined)}>
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
                                type === Types.SHOPPING
                                  ? [componentPk, modulebomlistitemPk, modulePk]
                                  : [componentPk]
                              }
                              replaceZero={false}
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
                        // isEditable={isLocationEditable}
                        locationArray={locationArray}
                        // setIsEditable={setIsLocationEditable}
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
                              // setIsLocationEditable(false);
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
                    <Button onClick={() => setOpen(undefined)} variant="muted">
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
