import { AxiosError } from "axios";
import { UseMutationResult } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";

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
      console.log(data)
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
