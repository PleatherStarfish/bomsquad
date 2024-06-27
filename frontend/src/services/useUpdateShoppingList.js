import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useUpdateShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: updateShoppingListMutate } = useMutation({
    mutationFn: ({ componentPk, ...data }) => {
      const componentPkCleaned = removeAfterUnderscore(componentPk);
      return axios.patch(`/api/shopping-list/${componentPkCleaned}/update/`, data, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true,
      });
    },
    onSuccess: () => {
      // Only invalidate the queries, which will trigger a refetch automatically if observers are active
      queryClient.invalidateQueries(["userShoppingList"]);
    },
  });

  return updateShoppingListMutate;
};

export default useUpdateShoppingList;
