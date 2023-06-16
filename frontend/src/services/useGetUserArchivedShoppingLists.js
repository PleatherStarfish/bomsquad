import _ from "lodash";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetArchivedShoppingLists = () => {
  const fetchData = async () => {
    const { data } = await axios.get("/api/shopping-list/get-archived/", {
      withCredentials: true,
    });

    // Group by time_saved
    const groupedByTimeSaved = _(data)
      .groupBy("time_saved")
      .toPairs()
      .sortBy(([time_saved]) => new Date(time_saved))
      .value();

    // Process each group
    return groupedByTimeSaved.map(([time_saved, shoppingList]) => {
      // Group by module within each time_saved group
      const groupedByModule = _(shoppingList)
        .groupBy("module_name")
        .toPairs()
        .sortBy(([key]) => (key === "null" ? "" : key))
        .map(([key, value]) => ({
          name: key,
          moduleId: value[0]?.module?.id,
          data: _.groupBy(value, "component.id")
        }))
        .value();

      // Aggregate components within each time_saved group
      const aggregatedComponents = _(shoppingList).uniqBy("component.id").sortBy("component.supplier.name").value();

      // Return time_saved along with groupedByModule and aggregatedComponents
      return {
        time_saved,
        groupedByModule,
        aggregatedComponents
      };
    });
  };

  const {
    data: archivedShoppingLists,
    isLoading: archivedShoppingListsLoading,
    isError: archivedShoppingListsError,
    error: archivedShoppingListsErrorMessage,
  } = useQuery(["archivedShoppingLists"], fetchData);

  return {
    archivedShoppingLists,
    archivedShoppingListsLoading,
    archivedShoppingListsError,
    archivedShoppingListsErrorMessage,
  };
};

export default useGetArchivedShoppingLists;
