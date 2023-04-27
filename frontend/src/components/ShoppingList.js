import ListSlice from "./shopping_list/listSlice";
import React from "react";
import _ from "lodash";
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
    return <div className="text-gray-500 animate-pulse">Loading...</div>;
  }

  return (
    <div>
      <div className="flex">
        {[{name: "", data: []}, ...userShoppingListData.groupedByModule, {name: "TOTAL", data: []}].map((value, index) => {
          const moduleSlug = Object.values(value.data)?.[0]?.[0]?.module?.slug
          return (<ListSlice key={value.name} name={value.name} slug={moduleSlug} index={index} allModulesData={userShoppingListData.groupedByModule} componentsInModule={value.data} aggregatedComponents={userShoppingListData?.aggregatedComponents} componentsAreLoading={userShoppingListIsLoading} />)
        })}
      </div>
    </div>
  );
};

export default ShoppingList;
