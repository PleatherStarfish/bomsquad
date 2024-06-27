import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddComponentToInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutateAsync: addComponentToInventory, isPending } = useMutation({
    mutationFn: ({ componentId, quantity, location }) => {
      const componentIdCleaned = removeAfterUnderscore(componentId)

      const quantityData = quantity ? { quantity } : {}; // Only add quantity if it exists
      const locationData = location ? { location } : {}; // Only add location if it exists

      return axios.post(`/api/shopping-list/inventory/${componentIdCleaned}/add/`, {...quantityData, ...locationData}, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory"]);
      queryClient.invalidateQueries(["authenticatedUserHistory"]);
      queryClient.invalidateQueries(["userShoppingList"]);
    },
  });

  return { addComponentToInventory, isPending };
};

export default useAddComponentToInventory;