import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";

// Define the type for the mutation argument
interface DeleteArchivedListPayload {
  timestamp: string;
}

const useDeleteArchivedShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: ({ timestamp }: DeleteArchivedListPayload) => {
      return axios.delete(`/api/shopping-list/delete/${timestamp}/`, {
        headers: {
          "X-CSRFToken": csrftoken || "", // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["archivedShoppingLists"] });
    },
  });

  return deleteMutation;
};

export default useDeleteArchivedShoppingList;
