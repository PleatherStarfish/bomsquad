import { useMutation, useQueryClient, UseMutationResult } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios, { AxiosError } from "axios";

interface UpdateUserInventoryPayload {
  inventoryPk: string; // The primary key of the inventory item to update
  [key: string]: any; // Other fields to update
}

const useUpdateUserInventory = (): {
  updateUserInventoryMutate: UseMutationResult<void, AxiosError, UpdateUserInventoryPayload>["mutateAsync"];
  error: AxiosError | null;
} => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutateAsync: updateUserInventoryMutate, error } = useMutation<void, AxiosError, UpdateUserInventoryPayload>({
    mutationFn: async ({ inventoryPk, ...data }: UpdateUserInventoryPayload) => {
      return axios.patch(`/api/inventory/${inventoryPk}/update/`, data, {
        headers: {
          "X-CSRFToken": csrftoken || "", // Include the csrftoken as a header in the request
        },
        withCredentials: true, // Enable sending cookies with CORS requests
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["inventory"]});
      queryClient.invalidateQueries({queryKey: ["authenticatedUserHistory"]});
    },
    retry: false,
  });

  return { error, updateUserInventoryMutate };
};

export default useUpdateUserInventory;
