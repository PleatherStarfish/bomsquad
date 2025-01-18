import groupBy from "lodash/groupBy";
import toPairs from "lodash/toPairs";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useGetArchivedShoppingLists = () => {
  const fetchData = async () => {
    const { data } = await axios.get("/api/shopping-list/get-archived/", {
      withCredentials: true,
    });

    // Group by time_saved
    const groupedByTimeSaved = sortBy(
      toPairs(groupBy(data, "time_saved")),
      ([time_saved]) => new Date(time_saved)
    );

    // Process each group
    return groupedByTimeSaved.map(([time_saved, shoppingList]) => {
      // Group by module within each time_saved group
      const groupedByModule = sortBy(
        toPairs(groupBy(shoppingList, "module_name")),
        ([key]) => (key === "null" ? "" : key)
      ).map(([key, value]) => ({
        data: groupBy(value, "component.id"),
        moduleId: value[0]?.module?.id,
        name: key,
      }));

      // Aggregate components within each time_saved group
      const aggregatedComponents = sortBy(
        uniqBy(shoppingList, "component.id"),
        "component.supplier.name"
      );

      // Extract notes (check if notes exist and access note property)
      const notes =
        shoppingList.length > 0 && shoppingList[0].notes
          ? shoppingList[0].notes.note
          : null;

      // Return time_saved along with groupedByModule, aggregatedComponents, and notes
      return {
        aggregatedComponents,
        groupedByModule,
        notes,
        time_saved,
      };
    });
  };

  const {
    data: archivedShoppingLists,
    isLoading: archivedShoppingListsLoading,
    isError: archivedShoppingListsError,
    error: archivedShoppingListsErrorMessage,
  } = useQuery({
    queryFn: fetchData,
    queryKey: ["archivedShoppingLists"],
  });

  return {
    archivedShoppingLists,
    archivedShoppingListsError,
    archivedShoppingListsErrorMessage,
    archivedShoppingListsLoading,
  };
};

export default useGetArchivedShoppingLists;
