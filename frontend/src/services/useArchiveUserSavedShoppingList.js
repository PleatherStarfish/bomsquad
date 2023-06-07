import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useArchiveShoppingListMutation = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient(); // Get queryClient instance

  return useMutation(
    async () => {
      const response = await axios.post(
        `/api/shopping-list/archive/`,
        {},
        {
          headers: {
            "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
          },
          withCredentials: true, // enable sending cookies with CORS requests
        }
      );
      return response.data;
    },
    {
      // Use onSuccess to invalidate and refetch the related query after mutation
      onSuccess: () => {
        queryClient.invalidateQueries("userSavedLists");
        queryClient.refetchQueries("userSavedLists");
      },
    }
  );
};

export default useArchiveShoppingListMutation;
