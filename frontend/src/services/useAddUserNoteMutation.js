import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';

const useAddUserNoteMutation = (moduleType) => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`/api/user-notes/${moduleType}/`, data, {
        headers: {
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userNotes', `${moduleType}`]);
    },
    onError: (error) => {
      console.error('Error adding user note:', error);
    }
  });
};

export default useAddUserNoteMutation;
