import Cookies from 'js-cookie';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const useGetUserNote = (moduleId, moduleType) => {
  const csrftoken = Cookies.get('csrftoken');

  return useQuery({
    queryKey: ['userNote', moduleId, moduleType],
    queryFn: async () => {
      const response = await axios.get(`/api/user-notes/${moduleType}/${moduleId}/`, {
        headers: {
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });
      console.log(response.data)
      return response.data;
    },
    retry: false
  });
};

export default useGetUserNote;
