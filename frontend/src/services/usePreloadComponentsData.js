import useGetComponentsByIds from './useGetComponentsByIds';
import { useQuery } from '@tanstack/react-query';

export const usePreloadData = (componentPks) => {

  // Fetch and cache components data on hover
  return useQuery(
    ['components', componentPks],
    () => useGetComponentsByIds(componentPks),
  );
};

// Function to manually preload data into cache
export const preloadComponentsData = (queryClient, componentPks) => {
  queryClient.prefetchQuery(["getComponentsByIds", componentPks], () =>
    useGetComponentsByIds(componentPks)
  );
};