import Cookies from 'js-cookie';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const useGetUserNote = (moduleId, moduleType) => {
  const csrftoken = Cookies.get('csrftoken');

  return useQuery({
    queryFn: async () => {
      const response = await axios.get(`/api/user-notes/${moduleType}/${moduleId}/`, {
        headers: {
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });
      return response.data;
    },
    queryKey: ['userNote', moduleId, moduleType],
    retry: false
  });
};

export default useGetUserNote;
