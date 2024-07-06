import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddOrUpdateUserInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ componentId, ...data }) => {
      const componentIdCleaned = removeAfterUnderscore(componentId);
      return axios.post(`/api/inventory/${componentIdCleaned}/create-or-update/`, data, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["inventory"]);
      queryClient.invalidateQueries(["authenticatedUserHistory"]);
    },
  });

  return mutation;
};

export default useAddOrUpdateUserInventory;