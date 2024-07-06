import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddOrUpdateUserAnonymousShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ componentId, quantity, editMode }) => {
      const componentIdCleaned = removeAfterUnderscore(componentId);
      
      return axios.post(
        `/api/shopping-list/${componentIdCleaned}/anonymous-create-or-update/`,
        { quantity, editMode },
        {
          headers: {
            "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
          },
          withCredentials: true, // enable sending cookies with CORS requests
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["shoppingList"]);
    },
  });

  return mutation;
};

export default useAddOrUpdateUserAnonymousShoppingList;
