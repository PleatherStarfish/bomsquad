import _ from "lodash";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useUserShoppingList = () => {
  const {
    data: userShoppingListData,
    isLoading: userShoppingListIsLoading,
    isError: userShoppingListIsError,
  } = useQuery({
    queryKey: ["userShoppingList"],
    queryFn: async () => {
      const response = await axios.get("/api/shopping-list/");
      const groupedByModule = _(response.data)
        .groupBy("module_name")
        .toPairs()
        .sortBy(([key]) => (key === "null" ? "" : key)) // key by component id
        .map(([key, value]) => ({ name: key, moduleId: value[0]?.module?.id, data: _.groupBy(value, "component.id") }))
        .value();

      const aggregatedComponents = _(response.data).uniqBy("component.id").sortBy("component.supplier.name").value();
      const componentModuleMap = _(response.data)
        .groupBy("component.id")
        .mapValues((components, componentId) => {
          return {
            componentId,
            modules: _.uniqBy(components, "module_name"),
          };
        })
        .values()
        .value();

      // TODO: depricate aggregatedComponents and switch to componentModuleMap
      
      return { groupedByModule, aggregatedComponents, componentModuleMap };
    }
  });

  return {
    userShoppingListData,
    userShoppingListIsLoading,
    userShoppingListIsError,
  };
};

export default useUserShoppingList;
