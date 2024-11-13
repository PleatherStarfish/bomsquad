import { UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

interface AddToBuiltResponse {
  success: boolean;
  message: string;
}

interface AddToBuiltOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const useAddToBuiltMutation = (
  moduleId: string,
  options?: AddToBuiltOptions
): UseMutationResult<AddToBuiltResponse, Error, void> => {
  const csrftoken = Cookies.get('csrftoken') || '';
  const queryClient = useQueryClient();
  const moduleIdCleaned = removeAfterUnderscore(moduleId);

  return useMutation<AddToBuiltResponse, Error, void>({
    mutationFn: async (): Promise<AddToBuiltResponse> => {
      const response = await axios.post<AddToBuiltResponse>(
        `/add-to-built/${moduleIdCleaned}/`,
        {},
        {
          headers: {
            'X-CSRFToken': csrftoken,
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    mutationKey: ["built"],
    onError: (error: Error) => {
      console.error('Error adding to built modules:', error);
      if (options?.onError) options.onError(error); // call custom onError if provided
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['built'] });
      if (options?.onSuccess) options.onSuccess(); // call custom onSuccess if provided
    },
  });
};

export default useAddToBuiltMutation;
