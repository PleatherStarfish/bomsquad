import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useDeleteUserInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: ({ inventoryPk }) => {
      
      // const componentPkCleaned = removeAfterUnderscore(inventoryPk)

      return axios.delete(`/api/inventory/${inventoryPk}/delete/`, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("inventory");
      queryClient.refetchQueries("inventory");
    },
  });
  return deleteMutation;
};

export default useDeleteUserInventory;
