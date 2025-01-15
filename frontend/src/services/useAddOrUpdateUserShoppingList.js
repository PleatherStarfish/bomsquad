import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddOrUpdateUserShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ componentId, ...data }) => {
      console.log("useAddOrUpdateUserShoppingList componentId", componentId);
      console.log("useAddOrUpdateUserShoppingList data", data);
      const cleanedModuleBomListItemPk = removeAfterUnderscore(data.modulebomlistitem_pk);
      const componentIdCleaned = removeAfterUnderscore(componentId);
      
      return axios.post(
        `/api/shopping-list/${componentIdCleaned}/create-or-update/`,
        { ...data, modulebomlistitem_pk: cleanedModuleBomListItemPk },
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["shoppingList"]);
    },
  });

  return mutation;
};

export default useAddOrUpdateUserShoppingList;
