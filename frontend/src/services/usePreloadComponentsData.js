import useGetComponentsByIds from './useGetComponentsByIds';
import { useQuery } from '@tanstack/react-query';

export const usePreloadData = (componentPks) => {

  // Fetch and cache components data on hover
  return useQuery(
    ['components', componentPks],
    () => useGetComponentsByIds(componentPks),
    {
      enabled: false, // Disabled by default, will be triggered manually
      staleTime: 10000, // Cached data remains fresh for 10 seconds
    }
  );
};

// Function to manually preload data into cache
export const preloadComponentsData = (queryClient, componentPks) => {
  queryClient.prefetchQuery(["getComponentsByIds", componentPks], () =>
    useGetComponentsByIds(componentPks)
  );
};