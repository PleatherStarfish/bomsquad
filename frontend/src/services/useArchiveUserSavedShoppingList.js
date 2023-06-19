import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useArchiveShoppingListMutation = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  return useMutation(
    async ({notes}) => {

      const response = await axios.post(
        "/api/shopping-list/archive/",
        {notes},
        {
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("userSavedLists");
        queryClient.refetchQueries("userSavedLists");
      },
    }
  );
};

export default useArchiveShoppingListMutation;
