import axios from 'axios';
import { useQuery } from "@tanstack/react-query";

const useGetUserInventoryQuantity = (componentPk) => {
  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(`/api/inventory/${componentPk}/component-quantity/`);
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  const {data, isLoading, isError, error} = useQuery(['userInventoryQuantity', componentPk], fetchUserInventoryQuantity);

  return {data, isLoading, isError, error}
};

export default useGetUserInventoryQuantity;