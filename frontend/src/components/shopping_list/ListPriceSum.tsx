import React from "react";
import convertUnitPrice from "../../utils/convertUnitPrice"
import useGetUserCurrency from "../../services/useGetUserCurrency";
import useGetUserShoppingListTotalPrice from "../../services/useGetUserShoppingListTotalPrice";

interface ListPriceSumProps {
  currency: string;
}

const ListPriceSum: React.FC<ListPriceSumProps> = () => {
  const { totalPriceData, totalPriceIsLoading, totalPriceIsError } = useGetUserShoppingListTotalPrice();
  const { data: currencyData } = useGetUserCurrency();

  if (totalPriceIsError) {
    return <div>Error fetching data</div>;
  }

  if (totalPriceIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  const totalMinPrice = convertUnitPrice(totalPriceData?.total_min_price || 0, currencyData);
  const totalMaxPrice = convertUnitPrice(totalPriceData?.total_max_price || 0, currencyData);

  return (
    <span className="text-xs font-bold">
      {totalMinPrice === totalMaxPrice ? totalMinPrice : `${totalMinPrice} - ${totalMaxPrice}`}
    </span>
  );
};

export default ListPriceSum;
