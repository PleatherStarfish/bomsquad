import {
  CheckIcon,
  FolderPlusIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import debounce from "lodash/debounce";

import AddAllModal from "./addAllModal";
import Alert from "../../ui/Alert";
import Button from "../../ui/Button";
import ListSlice from "./listSlice";
import Modal from "../../ui/Modal";
import Notification from "../../ui/Notification";
import useAddComponentToInventory from "../../services/useAddComponentToInventory";
import useArchiveShoppingListMutation from "../../services/useArchiveUserSavedShoppingList";
import useGetUserShoppingList from "../../services/useGetUserShoppingList";
import { UserShoppingList } from "../../types/shoppingList";

const ShoppingList: React.FC = () => {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const { isPending } = useAddComponentToInventory();

  const [addAllModalOpen, setAddAllModalOpen] = useState<boolean>(false);
  const [saveListModalOpen, setSaveListModalOpen] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [saveListClicked, setSaveListClicked] = useState<boolean>(false);
  const [mouserToolModalOpen, setMouserToolModalOpen] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  } = useGetUserShoppingList();

  const archiveShoppingListMutation = useArchiveShoppingListMutation();
  const debouncedArchiveMutation = useCallback(
    debounce((notes: string) => {
      archiveShoppingListMutation.mutate({ notes });
    }, 1000),
    [archiveShoppingListMutation]
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

  const calculateFullHeight = (element: HTMLElement): number => {
      if (!element.offsetParent) {
        console.warn("Element is not visible:", element);
        return 0; // Return 0 for hidden or non-rendered elements
      }
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);
    
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
      const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;
      const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0;
    
      return rect.height + marginTop + marginBottom + borderTop + borderBottom;
    };
  
    useEffect(() => {
      const resizeObserver = new ResizeObserver((entries) => {
        const newHeights: Record<string, number> = {};
      
        entries.forEach((entry) => {
          const rowId = entry.target.getAttribute("data-row-id");
          if (rowId && entry.target instanceof HTMLElement) {
            const height = calculateFullHeight(entry.target);
            if (height > 0) {
              newHeights[rowId] = height; // Only include valid heights
            }
          }
        });
      
        if (Object.keys(newHeights).length > 0) {
          setRowHeights((prev) => ({ ...prev, ...newHeights }));
        }
      });
    
      const observeRows = () => {
        Object.entries(rowRefs.current).forEach(([_, ref]) => {
          if (ref) resizeObserver.observe(ref);
        });
      };
    
      // Delay to ensure elements are rendered
      requestAnimationFrame(observeRows);
    
      return () => resizeObserver.disconnect();
    
    }, [userShoppingListData?.aggregatedComponents, rowRefs, calculateFullHeight]);

  const copyMouserDataToClipboard = () => {
    let copyString = "";
    userShoppingListData?.aggregatedComponents.forEach((item) => {
      if (item?.component.supplier?.name === "Mouser Electronics") {
        copyString += `${item?.component?.supplier_item_no}|${item?.quantity}\n`;
      }
    });

    navigator.clipboard.writeText(copyString)
  };

  const LoadingOverlay: React.FC = () => (
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

  const mouserItems = userShoppingListData?.aggregatedComponents.filter(
    (item) => item?.component.supplier?.name === "Mouser Electronics"
  ) ?? [];

  return (
    <>
      <Notification
        message="Your shopping list was successfully saved."
        setShow={setShowNotification}
        show={showNotification}
        title="Success!"
      />
      {!!userShoppingListData?.groupedByModule.length ? (
        <div className="flex flex-col gap-6">
          <div className="flex justify-end w-full gap-2 flex-nowrap">
            <Link to="saved-lists/">
              <Button variant="primary">Go to saved lists</Button>
            </Link>
            <Button
              Icon={saveListClicked ? CheckIcon : HeartIcon}
              onClick={() => setSaveListModalOpen(true)}
              variant="primary"
            >
              Save shopping list
            </Button>
            <Button
              onClick={() => setMouserToolModalOpen(true)}
              variant="primary"
            >
              Copy to Mouser
            </Button>
            <Button
              Icon={FolderPlusIcon}
              onClick={() => setAddAllModalOpen(true)}
              variant="primary"
            >
              Add all to inventory
            </Button>
          </div>
          <div className="flex justify-start w-full">
            {[
              { data: [], name: "" },
              ...userShoppingListData.groupedByModule,
              { data: [], name: "TOTAL QUANTITY" },
              { data: [], name: "TOTAL PRICE" },
              { data: [], name: "State" },
            ].map((value, index) => {
              const moduleSlug = Object.values(value.data)?.[0]?.[0]?.module?.slug;
              const moduleId = Object.values(value.data)?.[0]?.[0]?.module?.id;
              const componentsInModule = Array.isArray(value.data) ? {} : (value.data as Record<string, UserShoppingList[]>);
              return (
                <ListSlice
                  aggregatedComponents={
                    userShoppingListData?.aggregatedComponents
                  }
                  allModulesData={userShoppingListData.groupedByModule}
                  componentsAreLoading={userShoppingListIsLoading}
                  componentsInModule={componentsInModule}
                  index={index}
                  key={value.name}
                  moduleId={moduleId}
                  name={value.name}
                  rowHeights={rowHeights}
                  rowRefs={rowRefs}
                  slug={moduleSlug}
                />
              );
            })}
          </div>
        </div>
      ) : (
        <Alert variant="transparent">
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
        // userShoppingListData={userShoppingListData}
      />
      <Modal
        onSubmit={() => {
          setSaveListClicked(true);
          debouncedArchiveMutation(notes);
        }}
        open={saveListModalOpen}
        setOpen={setSaveListModalOpen}
        submitButtonText="Save"
        title="Enter name"
        type="warning"
      >
        <div className="flex flex-col gap-4">
          <span>Do you want to attach a descriptive note to your saved list?</span>
          <input
            className="block w-full rounded-md border-0 p-2 h-[32px] text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-brandgreen-600 sm:text-sm sm:leading-6"
            maxLength={1000}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Note (optional)"
            type="text"
            value={notes}
          />
        </div>
      </Modal>
      <Modal
        onlyCancelButton={mouserItems.length === 0}
        onSubmit={copyMouserDataToClipboard}
        open={mouserToolModalOpen}
        setOpen={setMouserToolModalOpen}
        submitButtonText="Copy"
        title="Copy to Mouser"
        type="info"
      >
        <div className="flex flex-col space-y-4">
          <span>
            Copy Mouser products to clipboard and paste them into the{" "}
            <a className="text-blue-500" href="https://www.mouser.com/Bom/CopyPaste">
              Mouser BOM tool
            </a>
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
              <Alert variant="muted">
                <span className="text-red-500">
                  No items from Mouser Electronics in the cart.
                </span>
              </Alert>
            )}
          </div>
          <textarea
            ref={textareaRef}
            style={{ left: "-9999px", position: "absolute" }}
          />
        </div>
      </Modal>
      {isPending && <LoadingOverlay />}
    </>
  );
};

export default ShoppingList;
