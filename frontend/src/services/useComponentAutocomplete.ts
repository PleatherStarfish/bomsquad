import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchComponentAutocomplete = async (query) => {
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';
  const response = await axios.get('/api/component-autocomplete/', {
    params: { q: query },
  });
  return response.data.results.map((item) => ({
    value: item.id,
    label: item.text,
  }));
};

export const useComponentAutocomplete = (inputValue: string) => {
  return useQuery({
    queryKey: ['componentAutocomplete', inputValue],
    queryFn: () => fetchComponentAutocomplete(inputValue),
    enabled: !!inputValue,  // Only run if inputValue is not empty
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};