import { QueryFunctionContext } from '@tanstack/react-query';

import { useQuery } from '@tanstack/react-query';

import axios from 'axios';
import removeAfterUnderscore from '../utils/removeAfterUnderscore';

// Define the type for the response data
interface AverageRatingResponse {
  average_rating: number;
  number_of_ratings: number;
}

// Define the types for the query key as readonly
type AverageRatingQueryKey = readonly [string, string, string];

// Function to fetch the average rating for a component and BOM list item
const fetchAverageRating = async ({ queryKey }: QueryFunctionContext<AverageRatingQueryKey>): Promise<AverageRatingResponse> => {
  const [, moduleBomListItemId, componentId] = queryKey;
  const moduleBomListItemIdCleaned = removeAfterUnderscore(moduleBomListItemId);
  const response = await axios.get<AverageRatingResponse>(`/api/average-rating/${moduleBomListItemIdCleaned}/${componentId}/`);
  return response.data;
};

// Custom hook to get the average rating for a component and BOM list item
const useGetAverageRating = (moduleBomListItemId: string, componentId: string) => {
  return useQuery<AverageRatingResponse, Error, AverageRatingResponse, AverageRatingQueryKey>({
    // @ts-expect-error: Seems to be unsupported at the moment
    cacheTime: 0,
    queryFn: fetchAverageRating,
    queryKey: ['averageRating', moduleBomListItemId, componentId] as const,
    retry: false, 
    staleTime: 0,
  });
};

export default useGetAverageRating;
