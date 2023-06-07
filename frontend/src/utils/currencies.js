export const CURRENCIES = Object.freeze({
  AUD: "Australian Dollar",
  BRL: "Brazilian Real",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNH: "Chinese Yuan",
  CZK: "Czech Koruna",
  DKK: "Danish Krone",
  EUR: "Euro",
  GBP: "British Pound",
  HKD: "Hong Kong Dollar",
  HUF: "Hungarian Forint",
  IDR: "Indonesian Rupiah",
  INR: "Indian Rupee",
  ILS: "Israeli New Shekel",
  JPY: "Japanese Yen",
  KRW: "South Korean Won",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  NOK: "Norwegian Krone",
  NZD: "New Zealand Dollar",
  PHP: "Philippine Peso",
  PLN: "Polish Złoty",
  QAR: "Qatari Riyal",
  RUB: "Russian Ruble",
  SAR: "Saudi Riyal",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  THB: "Thai Baht",
  TRY: "Turkish Lira",
  USD: "US Dollar",
  ZAR: "South African Rand",
  AED: "UAE Dirham",
});

export const roundToCurrency = (amount, currencyCode) => {
  // Define currency-specific decimals
  const decimals = {
      'AUD': 2,
      'BRL': 2,
      'CAD': 2,
      'CHF': 2,
      'CNH': 2,
      'CZK': 2,
      'DKK': 2,
      'EUR': 2,
      'GBP': 2,
      'HKD': 2,
      'HUF': 0,
      'IDR': 0,
      'INR': 2,
      'ILS': 2,
      'JPY': 0,
      'KRW': 0,
      'MXN': 2,
      'MYR': 2,
      'NOK': 2,
      'NZD': 2,
      'PHP': 2,
      'PLN': 2,
      'QAR': 2,
      'RUB': 2,
      'SAR': 2,
      'SEK': 2,
      'SGD': 2,
      'THB': 2,
      'TRY': 2,
      'USD': 2,
      'ZAR': 2,
      'AED': 2,
  };

  // If amount is not a number, parse it
  if (typeof amount !== 'number') {
      amount = parseFloat(amount);
  }

  // If amount is still not a number, return an error or handle this scenario as needed
  if (isNaN(amount)) {
      throw new Error('Amount must be a number');
  }

  // Find the decimal places for the currency
  const decimalPlaces = decimals[currencyCode];

  // If we don't have a specific rule for this currency, default to 2 decimal places
  if (decimalPlaces === undefined) {
      return amount.toFixed(2);
  }

  return amount.toFixed(decimalPlaces);
};



const CURRENCY_SYMBOLS = {
  AUD: "$",
  BRL: "R$",
  CAD: "$",
  CHF: "CHF",
  CNH: "¥",
  CZK: "Kč",
  DKK: "kr",
  EUR: "€",
  GBP: "£",
  HKD: "$",
  HUF: "Ft",
  IDR: "Rp",
  INR: "₹",
  ILS: "₪",
  JPY: "¥",
  KRW: "₩",
  MXN: "$",
  MYR: "RM",
  NOK: "kr",
  NZD: "$",
  PHP: "₱",
  PLN: "zł",
  QAR: "QR",
  RUB: "₽",
  SAR: "SR",
  SEK: "kr",
  SGD: "$",
  THB: "฿",
  TRY: "₺",
  USD: "$",
  ZAR: "R",
  AED: "د.إ",
};

const getCurrencySymbol = (currencyCode) => {
  return CURRENCY_SYMBOLS[currencyCode] || "";
};

export default getCurrencySymbol;
