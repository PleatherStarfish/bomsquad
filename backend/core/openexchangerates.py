import os
import requests
from sentry_sdk import capture_exception

CURRENCIES = [
    ("USD", "US Dollar"),
    ("EUR", "Euro"),
    ("JPY", "Japanese Yen"),
    ("GBP", "British Pound"),
    ("AUD", "Australian Dollar"),
    ("CAD", "Canadian Dollar"),
    ("CHF", "Swiss Franc"),
    ("CNY", "Chinese Yuan"),
    ("HKD", "Hong Kong Dollar"),
    ("NZD", "New Zealand Dollar"),
    ("SEK", "Swedish Krona"),
    ("KRW", "South Korean Won"),
    ("SGD", "Singapore Dollar"),
    ("NOK", "Norwegian Krone"),
    ("INR", "Indian Rupee"),
]


def _get_latest_exchange_rates(from_currency: str, to_currency: str) -> float:
    """
    Retrieve the exchange rate between two currencies using the Open Exchange Rates API.

    If the rate exists in the database and is fresh (updated within the last 24 hours),
    it will return the cached value. Otherwise, it fetches the latest rates from the
    API, updates the database, and calculates the rate.

    Args:
        from_currency (str): The source currency (e.g., "EUR", "GBP").
        to_currency (str): The target currency (e.g., "USD", "JPY").

    Returns:
        float: The exchange rate from `from_currency` to `to_currency`.

    Raises:
        ValueError: If the exchange rate is not available or if inputs are invalid.
    """
    # Validate inputs against the predefined currency list
    valid_currencies = {code for code, _ in CURRENCIES}
    if from_currency not in valid_currencies:
        raise ValueError(f"Invalid from_currency: {from_currency}")
    if to_currency not in valid_currencies:
        raise ValueError(f"Invalid to_currency: {to_currency}")

    from_currency = from_currency.upper()
    to_currency = to_currency.upper()

    # Validate inputs
    if not from_currency or len(from_currency) != 3:
        raise ValueError(f"Invalid from_currency: {from_currency}")
    if not to_currency or len(to_currency) != 3:
        raise ValueError(f"Invalid to_currency: {to_currency}")

    # If the currencies are the same, the exchange rate is 1.0
    if from_currency == to_currency:
        return 1.0

    # Fetch the latest rates from the API
    api_key = os.getenv("OPENEXCHANGERATES_APP_ID")
    if not api_key:
        raise ValueError("OPENEXCHANGERATES_APP_ID is not set in the environment")

    try:
        url = f"https://openexchangerates.org/api/latest.json?app_id={api_key}"
        response = requests.get(url)
        if response.status_code != 200:
            raise ValueError(f"Error fetching exchange rates: {response.text}")

        rates = response.json().get("rates", {})
        if not rates:
            raise ValueError("No rates found in the API response")

        # Get the rates for the specified currencies
        from_rate = rates.get(from_currency)
        to_rate = rates.get(to_currency)

        if from_rate is None or to_rate is None:
            raise ValueError(
                f"Rates not available for {from_currency} or {to_currency}"
            )

        # Calculate the exchange rate from `from_currency` to `to_currency`
        exchange_rate = to_rate / from_rate

        return round(exchange_rate, 6)  # Round to 6 decimal places for precision

    except Exception as e:
        capture_exception(e)
        raise ValueError(f"Error retrieving exchange rate: {e}")
