import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useUpdateShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: updateShoppingListMutate } = useMutation({
    mutationFn: ({ componentPk, ...data }) => {
      return axios.patch(`/api/shopping-list/${componentPk}/update/`, data, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("userShoppingList");
      queryClient.refetchQueries("userShoppingList");
    },
  });
  return updateShoppingListMutate;
};

export default useUpdateShoppingList;
