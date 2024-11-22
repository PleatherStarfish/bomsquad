import os
import requests


class OpenExchangeRatesError(Exception):
    """Custom exception for Open Exchange Rates errors."""

    print("OpenExchangeRatesError")


def get_latest_exchange_rates(base_currency="USD"):
    api_key = os.getenv("OPENEXCHANGERATES_APP_ID")
    if not api_key:
        raise OpenExchangeRatesError(
            "OPENEXCHANGERATES_APP_ID is not set in the environment"
        )

    url = f"https://openexchangerates.org/api/latest.json"
    params = {"app_id": api_key, "base": base_currency}
    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise OpenExchangeRatesError(
            f"Error fetching exchange rates: {response.json().get('error', 'Unknown error')}"
        )

    return response.json()
