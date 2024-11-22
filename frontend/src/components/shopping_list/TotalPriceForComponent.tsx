import React from "react";
import useUserShoppingListComponentTotalPrice from "../../services/useGetUserShoppingListComponentTotalPrice";
import useGetUserCurrency from "../../services/useGetUserCurrency";
import { roundToCurrency } from "../../utils/currencies";

interface TotalPriceForComponentProps {
  componentId: string;
}

const TotalPriceForComponent: React.FC<TotalPriceForComponentProps> = ({ componentId }) => {
  const { totalPriceData, totalPriceIsLoading, totalPriceIsError } =
    useUserShoppingListComponentTotalPrice(componentId);
  const { data: currencyData, isLoading: currencyIsLoading } = useGetUserCurrency();

  if (totalPriceIsError || !currencyData) {
    return <div>Error fetching data</div>;
  }

  if (totalPriceIsLoading || currencyIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  // Convert prices to the selected currency
  const convertPrice = (price: number | null): string => {
    if (!currencyData || price === null || price === undefined) return "N/A";
    const converted = price * currencyData.exchange_rate;
    return `${currencyData.currency_symbol}${roundToCurrency(converted, currencyData.default_currency)}`;
  };

  const totalMinPrice = convertPrice(totalPriceData?.total_min_price || 0);
  const totalMaxPrice = convertPrice(totalPriceData?.total_max_price || 0);

  return (
    <span className="text-xs font-bold">
      {totalMinPrice} - {totalMaxPrice}
    </span>
  );
};

export default TotalPriceForComponent;
