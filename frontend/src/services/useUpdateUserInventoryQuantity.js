import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import axios from "axios";

const useUpdateUserInventoryQuantity = (componentPk, quantity) => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient(); // Get queryClient instance

  return useMutation(
    async () => {
      const mutation = await axios.patch(
        `/inventory/${componentPk}/update-quantity/`,
        { quantity },
        {
          headers: {
            "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
          },
          withCredentials: true, // enable sending cookies with CORS requests
        }
      );
      return mutation;
    },
    {
      // Use onSuccess to invalidate and refetch the related query after mutation
      onSuccess: () => {
        queryClient.invalidateQueries("inventory");
        queryClient.refetchQueries("inventory");
      },
    }
  );
};

export default useUpdateUserInventoryQuantity;
