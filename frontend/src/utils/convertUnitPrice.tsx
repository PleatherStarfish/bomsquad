import { UserCurrency } from "../types/user";
import { roundToCurrency } from "./currencies"

type ExtendedUserCurrency = UserCurrency & {
  currency_symbol: string;
};

const convertUnitPrice = (
  unitPrice: number | null,
  currencyData?: ExtendedUserCurrency
): string => {
  if (!currencyData || unitPrice == null) return "N/A";

  const converted = unitPrice * currencyData.exchange_rate;
  return `${currencyData.currency_symbol}${roundToCurrency(
    converted,
    currencyData.default_currency
  )}`;
};

export default convertUnitPrice;
