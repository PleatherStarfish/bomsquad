import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";

interface DeleteUserResponse {
  message: string; // Adjust this interface based on the actual response structure
}

const useDeleteUser = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const deleteUser = async (): Promise<DeleteUserResponse> => {
    const response = await axios.delete<DeleteUserResponse>("/api/delete-user-me/", {
      headers: {
        "X-CSRFToken": csrftoken || "", // Include the csrftoken as a header in the request
      },
      withCredentials: true, // Enable sending cookies with CORS requests
    });
    return response.data;
  };

  const { mutate, isSuccess, isError } = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.removeQueries({queryKey: ["authenticatedUser"]}); // Adjusted to use array-based keys for better consistency
      window.location.href = "/";
    },
  });

  return { isError, isSuccess, mutate };
};

export default useDeleteUser;
