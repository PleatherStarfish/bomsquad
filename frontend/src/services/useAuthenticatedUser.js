import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useAuthenticatedUser = () => {
  const queryKey = ["authenticatedUser"];
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/get-user-me/", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch authenticated user");
    }
  };

  const {
    data: user,
    isLoading: userIsLoading,
    isError: userIsError,
  } = useQuery({
    queryKey,
    queryFn: fetchData,
  });

  return { user, userIsLoading, userIsError };
};

export default useAuthenticatedUser;
