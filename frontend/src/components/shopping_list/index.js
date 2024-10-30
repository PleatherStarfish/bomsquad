import { CheckIcon, FolderPlusIcon, HeartIcon } from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState } from "react";

import AddAllModal from "./addAllModal";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import { Link } from "react-router-dom";
import ListSlice from "./listSlice";
import Modal from "../../ui/Modal";
import Notification from "../../ui/Notification";
import _ from "lodash";
import useAddComponentToInventory from "../../services/useAddComponentToInventory";
import useArchiveShoppingListMutation from "../../services/useArchiveUserSavedShoppingList";
import useGetUserShoppingList from "../../services/useGetUserShoppingList";

const ShoppingList = () => {
  const textareaRef = React.useRef(null);
  const { isPending } = useAddComponentToInventory();
  
  const [addAllModalOpen, setAddAllModalOpen] = useState(false);
  const [saveListModalOpen, setSaveListModalOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [saveListClicked, setSaveListClicked] = useState(false);
  const [mouserToolModalOpen, setMouserToolModalOpen] = useState(false);
  const [notes, setNotes] = useState('');

  const {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  } = useGetUserShoppingList();

  const archiveShoppingListMutation = useArchiveShoppingListMutation();
  const debouncedArchiveMutation = useCallback(
    _.debounce((notes) => {
      archiveShoppingListMutation.mutate({notes});
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

  const copyMouserDataToClipboard = () => {
    let copyString = '';
    userShoppingListData.aggregatedComponents.forEach((item) => {
      if (item?.component.supplier.name === "Mouser Electronics") {
        copyString += `${item?.component?.supplier_item_no}|${item?.quantity}\n`;
      }
    });
    
    navigator.clipboard.writeText(copyString).then(() => {
      // Handle successful copy, e.g. show a notification or toast
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  }

  const LoadingOverlay = () => (
    <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-pulse">Updating...</div>
    </div>
  );

  if (userShoppingListIsError) {
    return <div>Error fetching data</div>;
  }

  if (userShoppingListIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  const mouserItems = userShoppingListData.aggregatedComponents.filter(
    (item) => item?.component.supplier.name === "Mouser Electronics"
  );

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
                setSaveListModalOpen(true);
              }}
            >
              Save shopping list
            </Button>
            <Button
              version="primary"
              onClick={() => setMouserToolModalOpen(true)}
            >
              Copy to Mouser
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
              { name: "State", data: [] }
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
      <AddAllModal
        addAllModalOpen={addAllModalOpen}
        setAddAllModalOpen={setAddAllModalOpen}
        userShoppingListData={userShoppingListData}
      />
      <Modal
        open={saveListModalOpen}
        setOpen={setSaveListModalOpen}
        title={"Enter name"}
        submitButtonText={"Save"}
        type="warning"
        onSubmit={() => {
          setSaveListClicked(true);
          debouncedArchiveMutation(notes);
        }}
      >
        <div className="flex flex-col gap-4">
          <span>Do you want to attach a descriptive note to your saved list?</span>
          <input 
              type="text" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Note (optional)" 
              maxLength="1000"
              className="block w-full rounded-md border-0 p-2 h-[32px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
          />
        </div>
      </Modal>
      <Modal
        open={mouserToolModalOpen}
        setOpen={setMouserToolModalOpen}
        title={"Copy to Mouser"}
        submitButtonText={"Copy"}
        type="info"
        onSubmit={copyMouserDataToClipboard}
        onlyCancelButton={mouserItems.length === 0}
      >
        <div className="flex flex-col space-y-4">
          <span>
            <span>{"Copy Mouser products to clipboard and paste them into the "}</span>
            <a href="https://www.mouser.com/Bom/CopyPaste" className="text-blue-500">Mouser BOM tool</a>
          </span>
          <div>
            {mouserItems.length > 0 ? (
              <div className="w-full p-4 rounded bg-stone-200">
                <ul>
                  {mouserItems.map((item) => (
                    <li key={item?.component?.supplier_item_no}>
                      {`${item?.component?.supplier_item_no}|${item?.quantity}\n`}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Alert variant="muted" centered>
                <span className="text-red-500">
                  No items from Mouser Electronics in the cart.
                </span>
              </Alert>
            )}
          </div>
          {/* Hidden textarea for copying */}
          <textarea
            ref={textareaRef}
            style={{ position: 'absolute', left: '-9999px' }}
          />
        </div>
      </Modal>
      {isPending && <LoadingOverlay />}
    </>
  );
};

export default ShoppingList;
