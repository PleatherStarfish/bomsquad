import React, { useEffect } from 'react';

import cx from 'classnames';

export const Types = Object.freeze({
  INVENTORY: "inventory",
  SHOPPING: "shopping",
  SHOPPING_ANON: "shopping_anon",
});

const Quantity = ({ useHook, hookArgs, replaceZero = true, classNames = "", hideLoadingTag = false }) => {
  const [quantity, setQuantity] = React.useState();
  const { data, isLoading, error } = useHook(...Object.values(hookArgs));

  useEffect(() => {
    setQuantity(data);
  }, [data]);

  if (isLoading && !hideLoadingTag) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }

  if (isLoading && hideLoadingTag) {
    return <div className="text-center text-gray-500 animate-pulse">{'-'}</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <span className={cx("font-bold", classNames, { 'text-[#548a6a]': quantity !== 0, 'text-gray-500': quantity === 0 })}>
      {quantity === 0 && replaceZero ? '-' : quantity}
    </span>
  );
};

export default Quantity;
