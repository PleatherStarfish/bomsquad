import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from '@tanstack/react-query';

// Function to fetch the average rating for a component and BOM list item
const fetchAverageRating = async ({ queryKey }) => {
  const [, moduleBomListItemId, componentId] = queryKey;
  const moduleBomListItemIdCleaned = removeAfterUnderscore(moduleBomListItemId);
  const response = await axios.get(`/api/average-rating/${moduleBomListItemIdCleaned}/${componentId}/`);
  return response.data;
};

// Custom hook to get the average rating for a component and BOM list item
const useGetAverageRating = (moduleBomListItemId, componentId) => {
  return useQuery({
    queryKey: ['averageRating', moduleBomListItemId, componentId],
    queryFn: fetchAverageRating,
    retry: false,
  });
};

export default useGetAverageRating;
