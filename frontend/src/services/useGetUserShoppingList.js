import axios from "axios";
import { groupBy } from "lodash";
import { useQuery } from "@tanstack/react-query";

const useUserShoppingList = () => {
  const {
    data: userShoppingListData,
    isLoading: userShoppingListIsLoading,
    isError: userShoppingListIsError,
  } = useQuery(["userShoppingList"], async () => {
        const response = await axios.get("/api/shopping_list/");
        const grouped = groupBy(response.data, "module_name");
        return grouped;
      });
  return {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  };
}

export default useUserShoppingList;
