import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

interface ArchiveShoppingListPayload {
  notes: string;
}

interface ArchiveShoppingListResponse {
  success: boolean;
  message?: string;
}

const useArchiveShoppingListMutation = (): UseMutationResult<
  ArchiveShoppingListResponse,
  unknown,
  ArchiveShoppingListPayload
> => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  return useMutation<ArchiveShoppingListResponse, unknown, ArchiveShoppingListPayload>({
    mutationFn: async ({ notes }) => {
      const response = await axios.post<ArchiveShoppingListResponse>(
        "/api/shopping-list/archive/",
        { notes },
        {
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken || "",
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    onError: (error) => {
      // Optionally handle error, perhaps logging or displaying a notification
      console.error("Error archiving shopping list:", error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSavedLists"]});
    },
  });
};

export default useArchiveShoppingListMutation;
