export enum Currency {
  USD = "USD", // US Dollar
  EUR = "EUR", // Euro
  JPY = "JPY", // Japanese Yen
  GBP = "GBP", // British Pound
  AUD = "AUD", // Australian Dollar
  CAD = "CAD", // Canadian Dollar
  CHF = "CHF", // Swiss Franc
  CNY = "CNY", // Chinese Yuan
  HKD = "HKD", // Hong Kong Dollar
  NZD = "NZD", // New Zealand Dollar
  SEK = "SEK", // Swedish Krona
  KRW = "KRW", // South Korean Won
  SGD = "SGD", // Singapore Dollar
  NOK = "NOK", // Norwegian Krone
  INR = "INR", // Indian Rupee
}

export const currencyLookup: Record<string, { symbol: string; name: string }> = {
        AUD: { name: "Australian Dollar", symbol: "A$" },
        CAD: { name: "Canadian Dollar", symbol: "C$" },
        CHF: { name: "Swiss Franc", symbol: "CHF" },
        CNY: { name: "Chinese Yuan", symbol: "¥" },
        EUR: { name: "Euro", symbol: "€" },
        GBP: { name: "British Pound", symbol: "£" },
        HKD: { name: "Hong Kong Dollar", symbol: "HK$" },
        INR: { name: "Indian Rupee", symbol: "₹" },
        JPY: { name: "Japanese Yen", symbol: "¥" },
        KRW: { name: "South Korean Won", symbol: "₩" },
        NOK: { name: "Norwegian Krone", symbol: "kr" },
        NZD: { name: "New Zealand Dollar", symbol: "NZ$" },
        SEK: { name: "Swedish Krona", symbol: "kr" },
        SGD: { name: "Singapore Dollar", symbol: "S$" },
        USD: { name: "US Dollar", symbol: "$" },
      };