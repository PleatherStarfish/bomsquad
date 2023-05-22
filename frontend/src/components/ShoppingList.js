import ListSlice from "./shopping_list/listSlice";
import React from "react";
import _ from "lodash";
import Alert from "../ui/Alert";
import useGetUserShoppingList from "../services/useGetUserShoppingList";

const ShoppingList = () => {
  const {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  } = useGetUserShoppingList();

  if (userShoppingListIsError) {
    return <div>Error fetching data</div>;
  }

  if (userShoppingListIsLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }

  console.log("userShoppingListData", userShoppingListData)

  return (
  <>
    {!!userShoppingListData?.groupedByModule.length ? (
      <div>
        <div className="flex">
          {[
            { name: "", data: [] },
            ...userShoppingListData.groupedByModule,
            { name: "TOTAL", data: [] },
          ].map((value, index) => {
            console.log("userShoppingListData", userShoppingListData)
            const moduleSlug = Object.values(value.data)?.[0]?.[0]?.module
              ?.slug;
              const moduleId = Object.values(value.data)?.[0]?.[0]?.module
              ?.id;
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
  </>)
};

export default ShoppingList;
