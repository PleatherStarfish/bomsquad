import React, {useEffect} from 'react';

import cx from 'classnames';

export const Types = Object.freeze({
  SHOPPING: "shopping",
  SHOPPING_ANON: "shopping_anon",
  INVENTORY: "inventory",
});

const Quantity = ({ useHook, hookArgs, replaceZero = true, classNames }) => {
  const [quantity, setQuantity] = React.useState();
  const { data, isLoading, error } = useHook(...Object.values(hookArgs));

  useEffect(() => {
    setQuantity(data);
  }, [data]);

  if (isLoading) {
    return <div className="text-center text-gray-500 animate-pulse">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <span className={cx("font-bold", classNames, {'text-[#548a6a]': quantity !== 0, 'text-gray-500': quantity === 0})}>
      {quantity === 0 && replaceZero ? '-' : quantity}
    </span>
  );
};

export default Quantity;