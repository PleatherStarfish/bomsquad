import { useMutation, useQueryClient } from '@tanstack/react-query';

import Cookies from 'js-cookie';
import axios from 'axios';

const useDeleteUserNoteMutation = (noteId, moduleType) => {
  const csrftoken = Cookies.get('csrftoken');
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await axios.delete(`/api/user-notes/${moduleType}/${noteId}/`, {
        headers: {
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userNotes', moduleType]);
      queryClient.invalidateQueries(['userNote', moduleType]);
    },
    onError: (error) => {
      console.error('Error deleting user note:', error);
    }
  });
};

export default useDeleteUserNoteMutation;
