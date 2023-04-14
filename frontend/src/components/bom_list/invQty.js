import React from 'react';
import useUserInventoryQuantity from '../../services/useGetUserInventoryQuantity';

const InventoryQuantity = ({ componentPk }) => {
  const { data, isLoading, error } = useUserInventoryQuantity(componentPk);
  console.log(componentPk)

  if (isLoading) {
    return <div className="text-gray-700 animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <span>
      {data}
    </span>
  );
};

export default InventoryQuantity;