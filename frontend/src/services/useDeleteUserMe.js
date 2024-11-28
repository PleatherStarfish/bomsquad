import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";

const useDeleteUser = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const deleteUser = async () => {
    const response = await axios.delete("/api/delete-user-me/", {
      headers: {
        "X-CSRFToken": csrftoken, // Include the csrftoken as a header in the request
      },
      withCredentials: true, // enable sending cookies with CORS requests
    });
    return response.data;
  };

  const { mutate, isSuccess, isError, isLoading } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.removeQueries(["authenticatedUser"]); // Adjusted to use array-based keys for better consistency
      window.location.href = "/";
    }
  });

  return { isError, isLoading, isSuccess, mutate };
};

export default useDeleteUser;
