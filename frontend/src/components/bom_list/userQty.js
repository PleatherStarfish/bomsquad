import React, {useEffect} from 'react';

const InventoryQuantity = ({ useHook, hookArgs }) => {
  const [quantity, setQuantity] = React.useState();
  const { data, isLoading, error } = useHook(...hookArgs);

  useEffect(() => {
    setQuantity(data);
  }, [data]);

  if (isLoading) {
    return <div className="text-gray-700 animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <span className="font-bold text-[#548a6a]">
      {quantity}
    </span>
  );
};

export default InventoryQuantity;