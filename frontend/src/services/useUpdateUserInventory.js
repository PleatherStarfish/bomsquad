import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useUpdateUserInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: updateUserInventoryMutate } = useMutation({
    mutationFn: ({ componentPk, ...data }) => {
      return axios.patch(`/api/inventory/${componentPk}/update/`, data, {
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
  return updateUserInventoryMutate;
};

export default useUpdateUserInventory;
