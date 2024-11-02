from django.dispatch import receiver
from admin_honeypot.signals import honeypot
import sentry_sdk
from datetime import datetime, timedelta
from django.core.cache import cache  # Use Django's cache framework

# Constants
CACHE_EXPIRATION = 24 * 60 * 60  # 24 hours in seconds
ATTEMPT_COUNT_KEY_TEMPLATE = "honeypot_attempt_count_{ip}"
LOGGED_FLAG_KEY_TEMPLATE = "honeypot_logged_{ip}"


@receiver(honeypot)
def log_honeypot_attempt(sender, instance, request, **kwargs):
    ip_address = request.META.get("REMOTE_ADDR")

    # Cache keys specific to this IP
    attempt_count_key = ATTEMPT_COUNT_KEY_TEMPLATE.format(ip=ip_address)
    logged_flag_key = LOGGED_FLAG_KEY_TEMPLATE.format(ip=ip_address)

    # Increment the attempt count for the IP
    attempt_count = cache.get(attempt_count_key, 0) + 1
    cache.set(attempt_count_key, attempt_count, CACHE_EXPIRATION)

    # Check if a log has already been sent today for this IP
    if not cache.get(logged_flag_key):
        # Log to Sentry and set a flag indicating that logging was done today
        sentry_sdk.capture_message(
            f"Honeypot login attempt detected. IP: {ip_address}, Number of attempts: {attempt_count}",
            level="warning",
        )
        cache.set(logged_flag_key, True, CACHE_EXPIRATION)
