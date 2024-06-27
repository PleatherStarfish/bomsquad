import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddToWtbMutation = (moduleId) => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient(); // Get queryClient instance
  const moduleIdCleaned = removeAfterUnderscore(moduleId);

  return useMutation({
    mutationFn: async () => {
      const response = await axios.post(
        `/add-to-wtb/${moduleIdCleaned}/`,
        {},
        {
          headers: {
            "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
          },
          withCredentials: true, // enable sending cookies with CORS requests
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch the wtbModules query after mutation
      queryClient.invalidateQueries(["wtbModules"]);
    },
    onError: (error) => {
      // Optionally handle error, such as logging or user notifications
      console.error('Error adding to WTB modules:', error);
    }
  });
};

export default useAddToWtbMutation;
