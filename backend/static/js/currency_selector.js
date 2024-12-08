function updateCurrency(newCurrency) {
  localStorage.setItem("currency", newCurrency);

  const currencyContainer = $("#currency-container");
  const isAuthenticated = currencyContainer.data("is-authenticated") === "true";
  const csrfToken = currencyContainer.data("csrf-token");
  const userCurrencyUrl = currencyContainer.data("url-user-currency");

  // Update user's default currency on the server if authenticated
  if (isAuthenticated) {
    fetch(userCurrencyUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken, // Include CSRF token for security
      },
      body: JSON.stringify({ default_currency: newCurrency }),
    })
      .then((response) => {
        console.log("Response status:", response.status); // Debug response status
        if (response.ok || response.status === 403) {
          console.log("Reloading page...");
          window.location.replace(window.location.href); // Force reload
        } else {
          console.error("Error updating currency:", response.statusText);
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
        window.location.replace(window.location.href); // Reload on error
      });
  } else {
    console.log("User not authenticated, reloading...");
    window.location.replace(window.location.href); // Reload for unauthenticated users
  }
}

$(document).ready(function () {
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
    { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
    { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
    { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
    { code: "SEK", symbol: "kr", name: "Swedish Krona" },
    { code: "KRW", symbol: "₩", name: "South Korean Won" },
    { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
    { code: "NOK", symbol: "kr", name: "Norwegian Krone" },
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
  ];

  const currencySelector = $("#currency-selector");
  const currencyContainer = $("#currency-container");
  const defaultCurrency = currencyContainer.data("default-currency") || "USD";

  function getDefaultCurrency() {
    const isAuthenticated =
      currencyContainer.data("is-authenticated") === "true";
    if (isAuthenticated && defaultCurrency) {
      return defaultCurrency;
    }
    return localStorage.getItem("currency") || "USD";
  }

  function populateWithSymbols() {
    currencySelector.empty();
    currencies.forEach((currency) => {
      const option = $("<option>").val(currency.code).text(currency.symbol);
      currencySelector.append(option);
    });
    currencySelector.val(getDefaultCurrency());
  }

  function populateWithFullNames() {
    currencySelector.empty();
    currencies.forEach((currency) => {
      const option = $("<option>")
        .val(currency.code)
        .text(`${currency.name} (${currency.code})`);
      currencySelector.append(option);
    });
    currencySelector.val(getDefaultCurrency());
  }

  currencySelector.on("focus", populateWithFullNames);
  currencySelector.on("blur", populateWithSymbols);
  populateWithSymbols();

  currencySelector.on("change", function () {
    updateCurrency(this.value);
  });
});
