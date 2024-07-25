import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';

const useUpdateUserNoteMutation = (noteId, moduleType) => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(`/api/user-notes/${moduleType}/${noteId}/`, data, {
        headers: {
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userNotes', moduleType]);
      queryClient.invalidateQueries(['userNote', moduleType, noteId]);
    },
    onError: (error) => {
      console.error('Error updating user note:', error);
    }
  });
};

export default useUpdateUserNoteMutation;