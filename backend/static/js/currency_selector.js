function updateCurrency(newCurrency) {
  localStorage.setItem("currency", newCurrency);

  const currencyContainer = document.querySelector("#currency-container");
  const isAuthenticated =
    currencyContainer.dataset.isAuthenticated === "true";
  const csrfToken = currencyContainer.dataset.csrfToken;

  // Update user's default currency on the server if authenticated
  if (isAuthenticated) {
    fetch("/api/user-update-currency/", {
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
          window.location.replace(window.location.href); // Force reload
        } else {
          console.error("Error updating currency:", response.statusText);
        }
      })
      .catch((error) => {
        window.location.replace(window.location.href); // Reload on error
      });
  } else {
    window.location.replace(window.location.href); // Reload for unauthenticated users
  }
}

document.addEventListener("DOMContentLoaded", () => {
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

  const currencySelector = document.querySelector("#currency-selector");
  const currencyContainer = document.querySelector("#currency-container");
  const defaultCurrency =
    currencyContainer.dataset.defaultCurrency || "USD";

  function getDefaultCurrency() {
    const isAuthenticated =
      currencyContainer.dataset.isAuthenticated === "true";
    if (isAuthenticated && defaultCurrency) {
      return defaultCurrency;
    }
    return localStorage.getItem("currency") || "USD";
  }

  function populateWithSymbols() {
    currencySelector.innerHTML = "";
    currencies.forEach((currency) => {
      const option = document.createElement("option");
      option.value = currency.code;
      option.textContent = currency.symbol;
      currencySelector.appendChild(option);
    });
    currencySelector.value = getDefaultCurrency();
  }

  function populateWithFullNames() {
    currencySelector.innerHTML = "";
    currencies.forEach((currency) => {
      const option = document.createElement("option");
      option.value = currency.code;
      option.textContent = `${currency.name} (${currency.code})`;
      currencySelector.appendChild(option);
    });
    currencySelector.value = getDefaultCurrency();
  }

  currencySelector.addEventListener("focus", populateWithFullNames);
  currencySelector.addEventListener("blur", populateWithSymbols);
  populateWithSymbols();

  currencySelector.addEventListener("change", (event) => {
    updateCurrency(event.target.value);
  });
});
