import React from "react";
import convertUnitPrice from "../../utils/convertUnitPrice";
import useGetUserCurrency from "../../services/useGetUserCurrency";
import useGetUserShoppingListComponentTotalPrice from "../../services/useGetUserShoppingListComponentTotalPrice";

interface TotalPriceForComponentProps {
  componentId: string;
  currency: string;
}

const TotalPriceForComponent: React.FC<TotalPriceForComponentProps> = ({ componentId }) => {
  const { totalPriceData, totalPriceIsLoading, totalPriceIsError } =
  useGetUserShoppingListComponentTotalPrice(componentId);
  const { data: currencyData, isLoading: currencyIsLoading, isError: currencyIsError } =
    useGetUserCurrency();

  // If data is still loading, show a loading indicator
  if (totalPriceIsLoading || currencyIsLoading) {
    return (
      <div className="text-center text-gray-500 animate-pulse">Loading...</div>
    );
  }

  // If both calls failed, show a fallback message or value
  if (totalPriceIsError && currencyIsError) {
    return <span className="text-xs font-bold">N/A</span>;
  }

  const totalMinPrice = convertUnitPrice(totalPriceData?.total_min_price || 0, currencyData);
  const totalMaxPrice = convertUnitPrice(totalPriceData?.total_max_price || 0, currencyData);

  return (
    <span className="text-xs font-bold">
      {totalMinPrice === totalMaxPrice ? totalMinPrice : `${totalMinPrice} - ${totalMaxPrice}`}
    </span>
  );
};

export default TotalPriceForComponent;
