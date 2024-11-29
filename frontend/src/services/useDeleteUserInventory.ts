import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

interface DeleteUserInventoryPayload {
  inventoryPk: string; // Type for the payload argument
}

const useDeleteUserInventory = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const mutation = useMutation<void, unknown, DeleteUserInventoryPayload>({
    mutationFn: async ({ inventoryPk }: DeleteUserInventoryPayload) => {
      const componentPkCleaned = removeAfterUnderscore(inventoryPk);

      await axios.delete(`/api/inventory/${componentPkCleaned}/delete/`, {
        headers: {
          "X-CSRFToken": csrftoken || "", // Include the csrftoken as a header in the request
        },
        withCredentials: true, // Enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      // Automatically refetches the queries if observers are active
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  return {
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    mutate: mutation.mutate,
  };
};

export default useDeleteUserInventory;
