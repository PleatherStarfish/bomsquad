import { AxiosResponse } from "axios";
import { UseMutationResult } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

// Define the data structure for the mutation
interface AddOrUpdateUserInventoryData {
  quantity: number;
  location?: string[] | string | null;
  editMode?: boolean;
}

// Variables for mutation function
interface MutationVariables {
  componentId: string;
  data: AddOrUpdateUserInventoryData;
}

const useAddOrUpdateUserInventory = (): UseMutationResult<
  AxiosResponse,
  unknown,
  MutationVariables
> => {
  const csrftoken = Cookies.get("csrftoken") || "";
  const queryClient = useQueryClient();

  const mutation = useMutation<AxiosResponse, unknown, MutationVariables>({
    mutationFn: ({ componentId, data }) => {
      console.log("useAddOrUpdateUserInventory componentId", componentId);
      console.log("useAddOrUpdateUserInventory data", data);
      const componentIdCleaned = removeAfterUnderscore(componentId);
      return axios.post(`/api/inventory/${componentIdCleaned}/create-or-update/`, data, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["inventory"]});
      queryClient.invalidateQueries({queryKey: ["authenticatedUserHistory"]});
    },
  });

  return mutation;
};

export default useAddOrUpdateUserInventory;
