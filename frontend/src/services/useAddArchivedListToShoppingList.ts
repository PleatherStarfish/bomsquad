import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";

// Define the type for the mutation argument
interface AddArchivedListPayload {
  timestamp: string;
}

const useAddArchivedListToShoppingList = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutate: addArchivedListToShoppingList } = useMutation({
    mutationFn: ({ timestamp }: AddArchivedListPayload) => {
      return axios.post(
        `/api/shopping-list/archive/add/`,
        { timestamp },
        {
          headers: {
            "X-CSRFToken": csrftoken || "", // Include the csrftoken as a header in the request
          },
          withCredentials: true, // enable sending cookies with CORS requests
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userShoppingList"] });
    },
  });

  return addArchivedListToShoppingList;
};

export default useAddArchivedListToShoppingList;
