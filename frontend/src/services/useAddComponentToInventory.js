import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddComponentToInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: addComponentToInventory } = useMutation({
    mutationFn: ({ componentId, quantity }) => {
      const componentIdCleaned = removeAfterUnderscore(componentId)

      const requestData = quantity ? { quantity } : {}; // Only add quantity if it exists

      return axios.post(`/api/shopping-list/inventory/${componentIdCleaned}/add/`, requestData, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      // Invalidate and refetch the relevant queries after the mutation is successful
      queryClient.invalidateQueries("inventory");
      queryClient.refetchQueries("inventory");
      queryClient.invalidateQueries("authenticatedUserHistory");
      queryClient.refetchQueries("authenticatedUserHistory");
    },
  });

  return addComponentToInventory;
};

export default useAddComponentToInventory;