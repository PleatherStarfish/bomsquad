import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useAddToBuiltMutation = (moduleId) => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient(); // Get queryClient instance

  const moduleIdCleaned = removeAfterUnderscore(moduleId);

  return useMutation(
    async () => {
      const response = await axios.post(`/add-to-built/${moduleIdCleaned}/`, {}, {
        headers: {
          'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
      return response.data;
    },
    {
      // Use onSuccess to invalidate and refetch the related query after mutation
      onSuccess: () => {
        queryClient.invalidateQueries('builtModules');
        queryClient.refetchQueries('builtModules');
      },
    }
  );
};

export default useAddToBuiltMutation;