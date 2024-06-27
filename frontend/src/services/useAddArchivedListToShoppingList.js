import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useAddArchivedListToShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: addArchivedListToShoppingList } = useMutation({
    mutationFn: ({ timestamp }) => {
      return axios.post(`/api/shopping-list/archive/add/`, { timestamp }, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userShoppingList"]);
    },
  });
  return addArchivedListToShoppingList;
};

export default useAddArchivedListToShoppingList;
