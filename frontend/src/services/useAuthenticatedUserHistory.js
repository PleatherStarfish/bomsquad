import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useAuthenticatedUserHistory = () => {
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/get-user-history/", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch authenticated user history");
    }
  };

  const { data: userHistory, isLoading: userHistoryIsLoading, isError: userHistoryIsError } = useQuery({
    queryKey: ["authenticatedUserHistory"],
    queryFn: fetchData
  });

  return { userHistory, userHistoryIsLoading, userHistoryIsError };
};

export default useAuthenticatedUserHistory;
