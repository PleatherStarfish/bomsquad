import "tippy.js/dist/tippy.css";

import DataTable, { TableColumn } from "react-data-table-component";
import Quantity, { Types } from "../components/bom_list/quantity";
import React, { useEffect, useState, useRef, useMemo } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

import AddComponentModal from "../components/bom_list/addComponentModal";
import HeaderWithButton from "../ui/HeaderWithButton";
import Alert from "../ui/Alert";
import Button from "../ui/Button";
import Notification from "../ui/Notification";
import FullPageModal from "../ui/FullPageModal";
import RowWarning, { getBaseUrl } from "../ui/RowWarning";
import { Component } from "../types/component";
import { LinkIcon } from "@heroicons/react/24/outline";
import Pagination from "../components/components/Pagination";
import SearchForm from "../components/components/SearchForm";
import { roundToCurrency } from "../utils/currencies";
import useAuthenticatedUser from "../services/useAuthenticatedUser";
import { useForm } from "react-hook-form";
import useGetComponents from "../services/useGetComponents";
import useGetUserAnonymousShoppingListQuantity from "../services/useGetUserAnonymousShoppingListQuantity";
import useGetUserCurrency from "../services/useGetUserCurrency";
import { useSearchParams } from "react-router-dom";
import useUserInventoryQuantity from "../services/useGetUserInventoryQuantity";
import AddComponentForm from "../components/user_submissions/AddComponentForm";
import { Helmet } from "react-helmet-async";
import cv from "classnames";

const customStyles = {
  headCells: {
    style: {
      fontWeight: "bold",
    },
  },
  rows: {
    style: {
      padding: "0.2rem 0 0.2rem 0",
    },
  },
};

const pageTitle = "Browse Components for DIY Synth Projects | BOM Squad";
const pageDescription = "Explore a vast library of components for DIY synth projects. Filter by type, manufacturer, supplier, and more. Add components to your inventory and shopping list.";
const pageKeywords = "DIY synth components, modular synth parts, guitar pedal components, build your own synth";

const Components: React.FC = () => {
  const [notification, setNotification] = useState<{
    show: boolean;
    title: string;
    message: string;
  }>({
    message: "",
    show: false,
    title: "",
  });
  const [inventoryModalOpen, setInventoryModalOpen] = useState<
    string | undefined
  >();
  const [shoppingModalOpen, setShoppingModalOpen] = useState<
    string | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [fullPageModalOpen, setFullPageModalOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { register, control, handleSubmit, setValue } = useForm({
    defaultValues: {
      filters: JSON.parse(searchParams.get("filters") || "{}"),
      search: searchParams.get("search") || "",
    },
  });

  const formRef = useRef<HTMLFormElement>(null);

  const handleFormSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    }
  };

  // Fetch data based on watched form state
  const {
    componentsData,
    componentsAreLoading,
    componentsAreError,
    refetchComponents,
  } = useGetComponents({
    filters: JSON.parse(searchParams.get("filters") || "{}"),
    page: Number(searchParams.get("page") || currentPage),
    search: searchParams.get("search") || "",
  });

  const deduplicatedResults = useMemo(() => {
    if (!componentsData?.results) return [];
    const uniqueComponents = new Map();
    componentsData.results.forEach((component) => {
      if (!uniqueComponents.has(component.id)) {
        uniqueComponents.set(component.id, component);
      }
    });
    return Array.from(uniqueComponents.values());
  }, [componentsData?.results]);

  const { data: currencyData } = useGetUserCurrency();
  const { user } = useAuthenticatedUser();

  const handleSuccess = () => {
    setFullPageModalOpen(false);
    setNotification({
      message: "Your new component has been successfully submitted.",
      show: true,
      title: "Component Added",
    });
  };

  const onSubmit = (data: any) => {
    const {
      search,
      type,
      manufacturer,
      supplier,
      mounting_style,
      ...otherFilters
    } = data;

    const filters = {
      manufacturer: manufacturer !== "all" ? manufacturer : undefined,
      mounting_style: mounting_style !== "all" ? mounting_style : undefined,
      supplier: supplier !== "all" ? supplier : undefined,
      type: type !== "all" ? type : undefined,
      ...Object.fromEntries(
        Object.entries(otherFilters).filter(
          ([, value]) => value !== "all" && value !== "" && value !== undefined
        )
      ),
    };

    const structuredData = {
      filters,
      search: search || "",
    };

    refetchComponents({
      newFilters: filters,
      newPage: 1,
      newSearch: structuredData.search,
    });

    setSearchParams({
      filters: JSON.stringify(filters),
      page: "1",
      search: structuredData.search,
    });

    setCurrentPage(1); // Reset to page 1
  };

  // Sync `searchParams` with form state
  useEffect(() => {
    setValue("filters", JSON.parse(searchParams.get("filters") || "{}"));
    setValue("search", searchParams.get("search") || "");
    setCurrentPage(Number(searchParams.get("page") || 1));
  }, [searchParams, setValue]);

  // Ah yes, another bizarre useEffect hack to get around the quirks of react-data-table-component...
  useEffect(() => {
    const tableWrapper = document.getElementById("table__wrapper");

    if (tableWrapper && tableWrapper.children) {
      Array.from(tableWrapper.children).forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.overflow = "visible";
        }
      });
    }
  }, [componentsData]);

  useEffect(() => {
    if (componentsData?.page) {
      setCurrentPage(componentsData.page);
    }
  }, [componentsData?.page]);

  if (componentsAreError) {
    return <div className="p-3 ml-[47px] bg-gray-100">Error</div>;
  }

  const convertUnitPrice = (unitPrice: number | null): string => {
    if (!currencyData || unitPrice === null || unitPrice === undefined)
      return "N/A";
    const converted = unitPrice * currencyData.exchange_rate;
    return `${currencyData.currency_symbol}${roundToCurrency(
      converted,
      currencyData.default_currency
    )}`;
  };

  const handlePageChange = (newPage: number) => {
    const totalPages = Math.ceil((componentsData?.count || 0) / resultsPerPage);

    // Ensure valid page navigation
    if (newPage < 1 || newPage > totalPages) {
      console.warn("Invalid page navigation attempt:", newPage);
      return;
    }

    // Update query parameters
    setSearchParams({
      filters: searchParams.get("filters") || "{}",
      page: String(newPage),
      search: searchParams.get("search") || "",
    });

    // Trigger a re-fetch with the new page number
    refetchComponents({
      newFilters: JSON.parse(searchParams.get("filters") || "{}"),
      newPage,
      newSearch: searchParams.get("search") || "",
    });

    // Update the current page state
    setCurrentPage(newPage);
  };

  const resultsPerPage = 30;
  const totalPages = Math.ceil((componentsData?.count || 0) / resultsPerPage);

  const conditionalRowStyles = [
    {
      style: {
        borderRadius: "8px",
        boxShadow: "inset 0 0 0 2px #db2777",
        overflow: "visible",
      },
      when: (row: Component) => row.user_submitted_status === "pending",
    },
  ];

  const columns: TableColumn<Component>[] = [
    {
      cell: (row: Component) => {
        return (
          <RowWarning id={row.id} user_submitted_status={row.user_submitted_status ?? "approved"}>
            {row.discontinued ? (
              <span>
                <s>{row.description}</s>{" "}
                <span className="italic font-bold text-red-500">DISCONTINUED</span>
              </span>
            ) : (
              <a
                className="text-blue-500 hover:text-blue-700"
                href={`${getBaseUrl()}/components/${row.id}/`}
              >
                {row.description}
              </a>
            )}
          </RowWarning>
        );
      },
      grow: 1,
      minWidth: "250px",
      name: "Name",
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Type</div>,
      selector: (row: Component) => row.type?.name,
      sortable: true,
      wrap: true,
    },
    {
      hide: 1700,
      name: <div>Manufacturer</div>,
      selector: (row: Component) => row.manufacturer?.name || "",
      sortable: true,
      wrap: true,
    },
    {
      cell: (row) =>
        (row.supplier_items || []).length > 0 ? (
          <ul className="pl-5 list-disc">
            {row.supplier_items?.map((item) => (
              <li key={item.id}>
                <b>{item.supplier?.short_name}: </b>
                {item.supplier_item_no ? (
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    href={item.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.supplier_item_no}
                  </a>
                ) : (
                  <a
                    className="text-blue-500 hover:text-blue-700"
                    href={item.link}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <LinkIcon className="inline-block w-4 h-4" />
                  </a>
                )}
                {item.unit_price && (
                  <span className="text-xs text-gray-600">
                    {" "}
                    ({convertUnitPrice(item.unit_price)})
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          "No supplier items"
        ),
      name: "Suppliers",
      sortable: false,
      width: "210px",
    },
    {
      cell: (row: Component) => row.qualities || "", // Use the backend-generated qualities field
      name: <div>Qualities</div>,
      sortable: false, // Sorting this column might not be straightforward
      wrap: true,
    },
    {
      cell: (row: Component) => (
        <Quantity
          hideLoadingTag
          hookArgs={{ componentId: row.id }}
          useHook={useUserInventoryQuantity}
        />
      ),
      name: <div>Qty in User Inv.</div>,
      omit: !user?.username,
      sortable: false,
      width: "80px",
    },
    {
      cell: (row: Component) => (
        <Quantity
          hideLoadingTag
          hookArgs={{ componentId: row.id }}
          useHook={useGetUserAnonymousShoppingListQuantity}
        />
      ),
      name: <div>Qty in Shopping List</div>,
      omit: !user?.username,
      sortable: false,
      width: "80px",
    },
    {
      button: true,
      cell: (row: Component) => {
        return (
          <>
            <Button
              onClick={() => setInventoryModalOpen(row.id)}
              size="xs"
              variant="primary"
            >
              + Inventory
            </Button>
            <AddComponentModal
              componentName={
                row.supplier_item_no
                  ? `${row.supplier?.short_name} ${row.supplier_item_no}`
                  : row.description
              }
              componentPk={row.id}
              open={inventoryModalOpen === row.id}
              quantityRequired={1}
              setOpen={setInventoryModalOpen}
              text={`Add ${row.description} (${row.supplier?.short_name} ${row.supplier_item_no}) to your inventory?`}
              title={
                row.supplier_item_no
                  ? `Add ${row.supplier?.short_name} ${row.supplier_item_no} to Inventory?`
                  : `Add ${row.description} to Inventory?`
              }
              type={Types.INVENTORY}
            />
          </>
        );
      },
      ignoreRowClick: true,
      name: "",
      omit: !user?.username,
      sortable: false,
      width: "95px",
    },
    {
      button: true,
      cell: (row: Component) => {
        return (
          <>
            <Button
              onClick={() => {
                setShoppingModalOpen(row.id);
              }}
              size="xs"
              variant="primary"
            >
              + Shopping List
            </Button>
            <AddComponentModal
              componentName={`${row.supplier?.short_name} ${row.supplier_item_no}`}
              componentPk={row.id}
              open={shoppingModalOpen === row.id}
              quantityRequired={1}
              setOpen={setShoppingModalOpen}
              title={`Add ${row.supplier?.short_name} ${row.supplier_item_no} to Shopping List?`}
              type={Types.SHOPPING_ANON}
            />
          </>
        );
      },
      ignoreRowClick: true,
      name: "",
      omit: !user?.username,
      sortable: false,
      width: "115px",
    },
  ];

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta content={pageDescription} name="description" />
        <meta content={pageKeywords} name="keywords" />
      </Helmet>
      <div className="mb-8">
        <div className="w-full py-12">
          <div className="p-10 bg-gray-100 rounded-lg" id="dataElem">
            <SearchForm
              control={control}
              farads={componentsData?.unique_values?.farads ?? []}
              handleSubmit={handleSubmit}
              manufacturer={componentsData?.unique_values?.manufacturer ?? []}
              mounting_style={
                componentsData?.unique_values?.mounting_style ?? []
              }
              ohms={componentsData?.unique_values?.ohms ?? []}
              onSubmit={onSubmit}
              register={register}
              supplier={componentsData?.unique_values?.supplier ?? []}
              tolerance={componentsData?.unique_values?.tolerance ?? []}
              type={componentsData?.unique_values?.type ?? []}
              voltage_rating={
                componentsData?.unique_values?.voltage_rating ?? []
              }
            />
          </div>
        </div>
        <HeaderWithButton
          buttonText="Add a Component"
          icon={<PlusCircleIcon className="w-5 h-5" />}
          onButtonClick={() => setFullPageModalOpen(true)}
          title="Components"
        />
        {componentsAreLoading ? (
          <div className="text-center animate-pulse">Loading...</div>
        ) : (
          <>
            <>
              {!user?.username && (
                <div className="mb-8">
                  <Alert variant="warning">
                    <div className="alert alert-warning" role="alert">
                      <a
                        className="text-blue-500 hover:text-blue-700"
                        href="/accounts/login/"
                      >
                        <b>Login</b>
                      </a>{" "}
                      to add components to your shopping list and inventory.
                    </div>
                  </Alert>
                </div>
              )}
            </>
            <div id="table__wrapper" style={{overflowX: "visible"}}>
              <DataTable
                columns={columns}
                conditionalRowStyles={conditionalRowStyles}
                customStyles={customStyles}
                data={deduplicatedResults}
                progressPending={componentsAreLoading}
                responsive
              />
            </div>
            {componentsData?.results && (
              <div className="flex items-center justify-between py-4 bg-white border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  navigate={handlePageChange}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        )}
      </div>
      <FullPageModal
        customButtons={
          <div className="flex justify-end space-x-4">
            <button
              className="px-4 py-2 mt-4 text-sm font-medium text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => setFullPageModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 mt-4 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-brandgreen-600 hover:bg-brandgreen-700"
              onClick={handleFormSubmit}
            >
              <p className={cv({ "animate-pulse": isSubmitting })}>
                {isSubmitting ? "Submiting..." : "Submit"}
              </p>
            </button>
          </div>
        }
        onSubmit={() => {
          setFullPageModalOpen(false);
        }}
        open={fullPageModalOpen}
        setOpen={setFullPageModalOpen}
        submitButtonText="Save"
        subtitle={
          <p>
            New components can be added to your inventory and shopping list.
            They can be suggested as options for BOM list items. New components
            will be marked as &quot;pending&quot; until reviewed by the BOM
            Squad team.
          </p>
        }
        title="Add a Component"
      >
        <div>
          <AddComponentForm
            formRef={formRef}
            handleSuccess={handleSuccess}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </div>
      </FullPageModal>
      <Notification
        message={notification.message}
        setShow={(value) =>
          setNotification((prev) => ({
            ...prev,
            show: typeof value === "function" ? value(prev.show) : value,
          }))
        }
        show={notification.show}
        title={notification.title}
      />
    </>
  );
};

export default Components;
