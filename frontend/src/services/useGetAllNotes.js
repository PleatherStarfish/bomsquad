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
      console.log(response.data)
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || 'An error occurred while fetching the data.');
    }
  };

  const { data: notes, isLoading, isError } = useQuery({
    queryKey: ['userNotes', moduleType],
    queryFn: fetchAllNotes,
    enabled: !!moduleType,
    onError: (error) => {
      console.error('Error while fetching notes:', error);
    },
  });

  return { notes, isLoading, isError };
};

export default useGetAllNotes;
