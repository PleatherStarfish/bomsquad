import os
import requests
import sentry_sdk
from sentry_sdk import capture_exception

# Initialize Sentry SDK (ensure this is done at the application startup)
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),  # Replace with your Sentry DSN
    traces_sample_rate=1.0,  # Adjust this based on your needs
)


def get_latest_exchange_rates(base_currency="USD"):
    api_key = os.getenv("OPENEXCHANGERATES_APP_ID")
    if not api_key:
        error_message = "OPENEXCHANGERATES_APP_ID is not set in the environment"
        capture_exception(Exception(error_message))
        return {"error": error_message}

    url = f"https://openexchangerates.org/api/latest.json?app_id={api_key}&base={base_currency}"
    print(url)
    try:
        response = requests.get(url)
        print(response)
        if response.status_code != 200:
            error_message = f"Error fetching exchange rates: {response.json().get('error', 'Unknown error')}"
            capture_exception(Exception(error_message))
            return {"error": error_message}

        return response.json()
    except Exception as e:
        capture_exception(e)
        return {"error": str(e)}
