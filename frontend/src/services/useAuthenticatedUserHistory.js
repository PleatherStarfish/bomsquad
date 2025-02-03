import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useAuthenticatedUserHistory = () => {
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/get-user-history/", {
        withCredentials: true,
      });
      return response.data;
    } catch {
      throw new Error("Failed to fetch authenticated user history");
    }
  };

  const { data: userHistory, isLoading: userHistoryIsLoading, isError: userHistoryIsError } = useQuery({
    queryFn: fetchData,
    queryKey: ["authenticatedUserHistory"]
  });

  return { userHistory, userHistoryIsError, userHistoryIsLoading };
};

export default useAuthenticatedUserHistory;
