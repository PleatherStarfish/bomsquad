import { useQuery } from "@tanstack/react-query";
import axios from 'axios';

const useGetUserInventoryQuantity = (componentPk) => {
  const fetchUserInventoryQuantity = async () => {
    try {
      const response = await axios.get(`/api/inventory/${componentPk}/component-quantity/`);
      return response.data.quantity;
    } catch (error) {
      throw new Error(error.response.data.error);
    }
  };

  return useQuery(['userInventoryQuantity', componentPk], fetchUserInventoryQuantity);
};

export default useGetUserInventoryQuantity;