import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";

const useAddToWtbMutation = (moduleId) => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient(); // Get queryClient instance

  return useMutation(
    async () => {
      const response = await axios.post(
        `/add-to-wtb/${moduleId}/`,
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
    {
      // Use onSuccess to invalidate and refetch the related query after mutation
      onSuccess: () => {
        queryClient.invalidateQueries("wtbModules");
        queryClient.refetchQueries("wtbModules");
      },
    }
  );
};

export default useAddToWtbMutation;