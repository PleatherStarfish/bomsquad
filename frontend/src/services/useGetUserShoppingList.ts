import { GroupedByModule } from "../types/shoppingList";
import { UserShoppingList } from "../types/shoppingList";
import { UseUserShoppingListData } from "../types/shoppingList";

import { useQuery } from "@tanstack/react-query";

import axios from "axios";
import groupBy from "lodash/groupBy";
import sortBy from "lodash/sortBy";
import toPairs from "lodash/toPairs";
import uniqBy from "lodash/uniqBy";

const useUserShoppingList = () => {
  const {
    data: userShoppingListData,
    isLoading: userShoppingListIsLoading,
    isError: userShoppingListIsError,
  } = useQuery<UseUserShoppingListData>({
    queryFn: async (): Promise<UseUserShoppingListData> => {
      const response = await axios.get<UserShoppingList[]>("/api/shopping-list/");

      // Group data by module name
      const groupedByModule: GroupedByModule[] = sortBy(toPairs(groupBy(response.data, "module_name")), ([key]) =>
        key === "null" ? "" : key
      ).map(([key, value]) => ({
        data: groupBy(value, "component.id"),
        moduleId: value[0]?.module?.id,
        name: key,
      }));

      // Aggregate components and sort
      const aggregatedComponents = sortBy(uniqBy(response.data, "component.id"), "component.supplier?.short_name");

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
