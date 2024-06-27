import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useDeleteUserInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate, isSuccess, isError, isLoading } = useMutation({
    mutationFn: ({ inventoryPk }) => {
      const componentPkCleaned = removeAfterUnderscore(inventoryPk);

      return axios.delete(`/api/inventory/${componentPkCleaned}/delete/`, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // Enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      // Using only invalidateQueries as it automatically refetches the queries if observers are active
      queryClient.invalidateQueries(["inventory"]);
    },
  });

  return { mutate, isSuccess, isError, isLoading };
};

export default useDeleteUserInventory;
