import React from "react";
import convertUnitPrice from "../../utils/convertUnitPrice";
import useGetUserCurrency from "../../services/useGetUserCurrency";
import useUserShoppingListComponentTotalPrice from "../../services/useGetUserShoppingListComponentTotalPrice";

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

  const totalMinPrice = convertUnitPrice(totalPriceData?.total_min_price || 0, currencyData);
  const totalMaxPrice = convertUnitPrice(totalPriceData?.total_max_price || 0, currencyData);

  return (
    <span className="text-xs font-bold">
      {totalMinPrice === totalMaxPrice ? totalMinPrice : `${totalMinPrice} - ${totalMaxPrice}`}
    </span>
  );
};

export default TotalPriceForComponent;
