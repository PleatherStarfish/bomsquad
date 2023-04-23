import React from "react";
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
      <h1>Shopping List</h1>
    </div>
  );
};

export default ShoppingList;
