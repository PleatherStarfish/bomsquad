import React from "react";
import { roundToCurrency } from "../../utils/currencies";
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

  const convertPrice = (price: number | null): string => {
    if (!currencyData || price === null || price === undefined) return "N/A";
    const converted = price * currencyData.exchange_rate;
    return `${currencyData.currency_symbol}${roundToCurrency(
      converted,
      currencyData.default_currency
    )}`;
  };

  const totalMinPrice = convertPrice(totalPriceData?.total_min_price || 0);
  const totalMaxPrice = convertPrice(totalPriceData?.total_max_price || 0);

  return (
    <span className="text-xs font-bold">
      {totalMinPrice} - {totalMaxPrice}
    </span>
  );
};

export default ListPriceSum;
