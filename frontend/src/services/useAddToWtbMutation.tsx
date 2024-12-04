import { UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

interface AddToWtbResponse {
  // Define the expected structure of the API response
  success: boolean;
  message?: string;
}

const useAddToWtbMutation = (moduleId: string): UseMutationResult<AddToWtbResponse, Error, void> => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();
  const moduleIdCleaned = removeAfterUnderscore(moduleId);

  return useMutation<AddToWtbResponse, Error, void>({
    mutationFn: async () => {
      const response = await axios.post<AddToWtbResponse>(
        `/add-to-wtb/${moduleIdCleaned}/`,
        {},
        {
          headers: {
            "X-CSRFToken": csrftoken || "", // Include the CSRF token as a header in the request
          },
          withCredentials: true, // Enable sending cookies with CORS requests
        }
      );
      return response.data;
    },
    mutationKey: ["want-to-build"],
    onSuccess: () => {
      // Invalidate and refetch the want-to-build query after mutation
      queryClient.invalidateQueries({ queryKey: ["moduleStatus", moduleId] });
    }
  });
};

export default useAddToWtbMutation;
