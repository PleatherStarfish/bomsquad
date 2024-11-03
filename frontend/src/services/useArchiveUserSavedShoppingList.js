import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useArchiveShoppingListMutation = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notes }) => {
      const response = await axios.post(
        "/api/shopping-list/archive/",
        { notes },
        {
          headers: {
            "X-CSRFToken": csrftoken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the user saved lists queries after mutation
      queryClient.invalidateQueries(["userSavedLists"]);
    },
    onError: (error) => {
      // Optionally handle error, perhaps logging or displaying a notification
      console.error('Error archiving shopping list:', error);
    }
  });
};

export default useArchiveShoppingListMutation;
