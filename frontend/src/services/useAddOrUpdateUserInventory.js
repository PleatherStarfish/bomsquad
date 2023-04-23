import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useAddOrUpdateUserInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const {mutate: addOrUpdateUserInventory} = useMutation({
    mutationFn: ({ componentId, ...data }) => {
      return axios.post(
        `/api/inventory/${componentId}/add-or-update/`,
        data,
        {
          headers: {
            "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
          },
          withCredentials: true, // enable sending cookies with CORS requests
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries("inventory");
      queryClient.refetchQueries("inventory");
    },
  });
  return addOrUpdateUserInventory;
};

export default useAddOrUpdateUserInventory;
