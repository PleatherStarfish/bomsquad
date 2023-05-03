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

  const mutation = useMutation(deleteUser, {
    onSuccess: () => {
      queryClient.removeQueries("authenticatedUser"); // Remove the 'user' query from the cache
      window.location.href = "/";
    },
  });

  return mutation;
};

export default useDeleteUser;
