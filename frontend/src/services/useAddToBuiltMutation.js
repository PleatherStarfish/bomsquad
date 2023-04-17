import { useMutation } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import axios from 'axios';

const useAddToBuiltMutation = (moduleId) => {
  const csrftoken = Cookies.get('csrftoken');

  return useMutation(
    async () => {
      const response = await axios.post(`/add-to-built/${moduleId}/`, {}, {
        headers: {
          'X-CSRFToken': csrftoken, // Include the csrftoken as a header in the request
        },
        withCredentials: true, // enable sending cookies with CORS requests
      });
      return response.data;
    }
  );
};

export default useAddToBuiltMutation;