import { AxiosResponse } from "axios";
import { UseMutationResult } from "@tanstack/react-query";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

// Define the variables for the mutation function
interface MutationVariables {
  componentId: string; 
  quantity: number;
  location?: string;
  editMode?: boolean;
}

const useAddOrUpdateUserInventory = (): UseMutationResult<
  AxiosResponse,
  unknown,
  MutationVariables
> => {
  const csrftoken = Cookies.get("csrftoken") || "";
  const queryClient = useQueryClient();

  return useMutation<AxiosResponse, unknown, MutationVariables>({
    mutationFn: ({ componentId, quantity, location, editMode }) => {
      console.log(componentId);
      console.log(quantity, location, editMode);

      const componentIdCleaned = removeAfterUnderscore(componentId);
      return axios.post(
        `/api/inventory/${componentIdCleaned}/create-or-update/`,
        { editMode, location, quantity },
        {
          headers: {
            "X-CSRFToken": csrftoken, // CSRF protection header
          },
          withCredentials: true, // Include cookies for authentication
        }
      );
    },
    onSuccess: () => {
      // Invalidate and refetch relevant queries after mutation
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["authenticatedUserHistory"] });
    },
  });
};

export default useAddOrUpdateUserInventory;
