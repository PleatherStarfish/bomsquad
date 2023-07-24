import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useAddComponentToInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: addComponentToInventory } = useMutation({
    mutationFn: ({ componentId, quantity }) => {
      return axios.post(`/shopping-list/inventory/${componentId}/add/`, { quantity }, {
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