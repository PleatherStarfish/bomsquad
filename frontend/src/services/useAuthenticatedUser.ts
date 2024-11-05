import { User } from "../types/user"; // Import the User type
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useAuthenticatedUser = () => {
  const queryKey = ["authenticatedUser"];

  const fetchData = async (): Promise<User> => {
    try {
      const response = await axios.get<User>("/api/get-user-me/", {
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
  } = useQuery<User, Error>({
    queryKey,
    queryFn: fetchData,
  });

  return { user, userIsLoading, userIsError };
};

export default useAuthenticatedUser;
