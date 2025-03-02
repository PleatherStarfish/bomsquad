import Cookies from 'js-cookie';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const useGetAllNotes = (moduleType) => {
  const fetchAllNotes = async () => {
    try {
      const csrftoken = Cookies.get('csrftoken');
      const response = await axios.get(`/api/user-notes/${moduleType}/all/`, {
        headers: {
          'X-CSRFToken': csrftoken,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'An error occurred while fetching the data.');
    }
  };

  const { data: notes, isLoading, isError } = useQuery({
    enabled: !!moduleType,
    onError: (error) => {
      console.error('Error while fetching notes:', error);
    },
    queryFn: fetchAllNotes,
    queryKey: ['userNotes', moduleType],
  });

  return { isError, isLoading, notes };
};

export default useGetAllNotes;
