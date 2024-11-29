import {GroupedByModule, UseUserShoppingListData} from "../types/shoppingList"

import { UserShoppingList } from "../types/shoppingList";
import _ from "lodash";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useUserShoppingList = () => {
  const {
    data: userShoppingListData,
    isLoading: userShoppingListIsLoading,
    isError: userShoppingListIsError,
  } = useQuery<UseUserShoppingListData>({
    queryFn: async (): Promise<UseUserShoppingListData> => {
      const response = await axios.get<UserShoppingList[]>("/api/shopping-list/");

      const groupedByModule: GroupedByModule[] = _(response.data)
        .groupBy("module_name")
        .toPairs()
        .sortBy(([key]) => (key === "null" ? "" : key)) // Sort null keys to the end
        .map(([key, value]) => ({
          data: _.groupBy(value, "component.id"),
          moduleId: value[0]?.module?.id,
          name: key,
        }))
        .value();

      const aggregatedComponents = _(response.data)
        .uniqBy("component.id")
        .sortBy("component.supplier?.short_name")
        .value();

      return { aggregatedComponents, groupedByModule };
    },
    queryKey: ["userShoppingList"],
  });

  return {
    userShoppingListData,
    userShoppingListIsError,
    userShoppingListIsLoading,
  };
};

export default useUserShoppingList;
