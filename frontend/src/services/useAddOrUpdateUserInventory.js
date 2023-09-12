import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddOrUpdateUserInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: addOrUpdateUserInventory } = useMutation({
    mutationFn: ({ componentId, ...data }) => {
      const componentIdCleaned = removeAfterUnderscore(componentId)
      
      return axios.post(`/api/inventory/${componentIdCleaned}/create-or-update/`, data, {
        headers: {
          "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries("inventory");
      queryClient.refetchQueries("inventory");
      queryClient.invalidateQueries("authenticatedUserHistory");
      queryClient.refetchQueries("authenticatedUserHistory");
    },
  });
  return addOrUpdateUserInventory;
};

export default useAddOrUpdateUserInventory;
