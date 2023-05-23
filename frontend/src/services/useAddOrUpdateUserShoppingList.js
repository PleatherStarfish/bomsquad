import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useAddOrUpdateUserShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: addOrUpdateUserShoppingList } = useMutation({
    mutationFn: ({ componentId, ...data }) => {
      return axios.post(
        `/api/shopping-list/${componentId}/create-or-update/`,
        data,
        {
          headers: {
            "X-CSRFToken": csrftoken,
          },
          withCredentials: true,
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("shoppingList");
      queryClient.refetchQueries("shoppingList");
    },
  });

  return addOrUpdateUserShoppingList;
};

export default useAddOrUpdateUserShoppingList;
