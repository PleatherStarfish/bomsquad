import Cookies from 'js-cookie';
import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useModuleStatus = (moduleId) => {
  const csrftoken = Cookies.get('csrftoken');
  const moduleIdCleaned = removeAfterUnderscore(moduleId);
  console.log(moduleIdCleaned)

  const fetchModuleStatus = async () => {
    try {
      const response = await axios.get(`/api/module-status/${moduleIdCleaned}/`, {
        headers: {
          'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true // Enable sending cookies with CORS requests
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['moduleStatus', moduleIdCleaned],
    queryFn: fetchModuleStatus
  });

  return { data, isLoading, isError, error };
};

export default useModuleStatus;
