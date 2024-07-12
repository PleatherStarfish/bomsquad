import { useMutation, useQueryClient } from "@tanstack/react-query";

import Cookies from "js-cookie";
import axios from "axios";
import removeAfterUnderscore from "../utils/removeAfterUnderscore";

const useRateComponent = () => {
  const csrftoken = Cookies.get("csrftoken");
  const queryClient = useQueryClient();

  const { mutateAsync: rateComponentMutate, error } = useMutation({
    mutationFn: (data) => {
      const moduleBomListItemCleaned = removeAfterUnderscore(data.module_bom_list_item);

      const updatedData = {
        ...data,
        module_bom_list_item: moduleBomListItemCleaned,
      };

      return axios.post(`/api/rate/`, updatedData, {
        headers: {
          "X-CSRFToken": csrftoken,
        },
        withCredentials: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["component-ratings"]);
    },
  });

  return { rateComponentMutate, error };
};

export default useRateComponent;
