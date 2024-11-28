import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

interface RateComponentData {
  component: string;
  module_bom_list_item: string;
  rating: number;
}

interface UseRateComponentReturn {
  rateComponentMutate: (data: RateComponentData) => Promise<void>;
  error: unknown;
}

const useRateComponent = (): UseRateComponentReturn => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutateAsync: rateComponentMutate, error } = useMutation<void, unknown, RateComponentData>({
    mutationFn: (data) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["component-ratings"] });
    },
  });

  return { error, rateComponentMutate };
};

export default useRateComponent;
