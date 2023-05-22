import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useAddOrUpdateUserAnonymousShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const {mutate: addOrUpdateUserAnonymousShoppingList} = useMutation({
    mutationFn: ({ componentId, quantity }) => {
      return axios.post(
        `/api/shopping-list/${componentId}/anonymous-add-or-update/`,
        {quantity},
        {
          headers: {
            "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
          },
          withCredentials: true, // enable sending cookies with CORS requests
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("shoppingList");
      queryClient.refetchQueries("shoppingList");
    },
  });
  return addOrUpdateUserAnonymousShoppingList;
};

export default useAddOrUpdateUserAnonymousShoppingList;
