import _ from "lodash";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useUserShoppingList = () => {
  const {
    data: userShoppingListData,
    isLoading: userShoppingListIsLoading,
    isError: userShoppingListIsError,
  } = useQuery(["userShoppingList"], async () => {
    const response = await axios.get("/api/shopping-list/");
    const groupedByModule = _(response.data)
      .groupBy("module_name")
      .toPairs()
      .sortBy(([key]) => (key === "null" ? "" : key)) // key by component id
      .map(([key, value]) => ({ name: key, moduleId: value[0]?.module?.id, data: _.groupBy(value, "component.id") }))
      .value();

    const aggregatedComponents = _(response.data).uniqBy("component.id").sortBy("component.supplier.name").value();

    return { groupedByModule, aggregatedComponents };
  });
  return {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  };
};

export default useUserShoppingList;
