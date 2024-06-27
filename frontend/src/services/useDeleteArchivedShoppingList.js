import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useDeleteArchivedShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: ({ timestamp }) => {
      return axios.delete(`/api/shopping-list/delete/${timestamp}/`, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["archivedShoppingLists"]);
    },
  });
  return deleteMutation;
};

export default useDeleteArchivedShoppingList;