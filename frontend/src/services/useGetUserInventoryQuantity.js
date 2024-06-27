import axios from 'axios';
import removeAfterUnderscore from "../utils/removeAfterUnderscore";
import { useQuery } from "@tanstack/react-query";

const useGetUserInventoryQuantity = (componentPk) => {
  const componentPkCleaned = removeAfterUnderscore(componentPk);
  
  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(`/api/inventory/${componentPkCleaned}/component-quantity/`);
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ['userInventoryQuantity', componentPkCleaned],
    queryFn: fetchUserInventoryQuantity
  });

  return {data, isLoading, isError, error};
};

export default useGetUserInventoryQuantity;
