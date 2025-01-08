import { useQuery } from '@tanstack/react-query';

import axios from 'axios';

const fetchComponentAutocomplete = async (query) => {
  console.log(query);
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';
  const response = await axios.get('/api/component-autocomplete/', {
    params: { q: query },
  });
  console.log(response.data.results);
  return response.data.results.map((item) => ({
    label: item.text,
    value: item.id,
  }));
};

export const useComponentAutocomplete = (inputValue: string) => {
  return useQuery({
    enabled: !!inputValue,
    queryFn: () => fetchComponentAutocomplete(inputValue),
    queryKey: ['componentAutocomplete', inputValue],  // Only run if inputValue is not empty
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};