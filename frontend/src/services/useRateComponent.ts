import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";

import axios from "axios";
import Cookies from "js-cookie";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

interface RateComponentData {
  component: string;
  module_bom_list_item: string;
  rating: number;
}

const useRateComponent = ({ onSuccess }: { onSuccess: () => void; }) => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutateAsync: rateComponentMutate, error } = useMutation<void, unknown, RateComponentData, { previousData: any }>({
    mutationFn: async (data) => {
      const moduleBomListItemCleaned = removeAfterUnderscore(data.module_bom_list_item);

      const updatedData = {
        ...data,
        module_bom_list_item: moduleBomListItemCleaned,
      };

      return axios.post(`/api/rate/`, updatedData, {
        headers: {
          "X-CSRFToken": csrftoken ?? "",
        },
        withCredentials: true,
      });
    },
    onError: (_error, _variables, context) => {
      // Rollback to previous state on error
      if (context?.previousData) {
        queryClient.setQueryData(['averageRating', _variables.module_bom_list_item, _variables.component], context.previousData);
      }
    },
    onMutate: async (newRating) => {
      // Cancel any ongoing fetches for `useGetAverageRating`
      await queryClient.cancelQueries({ queryKey: ['averageRating', newRating.module_bom_list_item, newRating.component] });

      // Optimistically update the cached query before mutation
      const previousData = queryClient.getQueryData(['averageRating', newRating.module_bom_list_item, newRating.component]);

      queryClient.setQueryData(['averageRating', newRating.module_bom_list_item, newRating.component], (oldData: any) => {
        if (!oldData) return { average_rating: newRating.rating, number_of_ratings: 1 };
        return {
          ...oldData,
          average_rating: newRating.rating, // Update the cached rating
        };
      });

      return { previousData }; // Return the previous state in case we need to rollback
    },
    onSuccess: (_data, variables) => {
      // Ensure fresh data is fetched from the API after mutation
      queryClient.invalidateQueries({ queryKey: ['averageRating', variables.module_bom_list_item, variables.component] });
      onSuccess();
    },
  });

  return { error, rateComponentMutate };
};


export default useRateComponent;
