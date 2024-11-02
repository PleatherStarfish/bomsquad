from django.dispatch import receiver
from admin_honeypot.signals import honeypot
import sentry_sdk
from django.core.cache import cache
from datetime import datetime, timedelta

# Cache templates
ATTEMPT_COUNT_KEY_TEMPLATE = "honeypot_attempt_count_{ip}"
LAST_LOG_KEY = "honeypot_last_log"
CACHE_EXPIRATION = 24 * 60 * 60  # 24 hours


@receiver(honeypot)
def log_honeypot_attempt(sender, instance, request, **kwargs):
    ip_address = request.META.get("REMOTE_ADDR")
    attempt_count_key = ATTEMPT_COUNT_KEY_TEMPLATE.format(ip=ip_address)

    # Increment the count of attempts for this IP
    attempt_count = cache.get(attempt_count_key, 0) + 1
    cache.set(attempt_count_key, attempt_count, CACHE_EXPIRATION)

    # Check if we've already logged attempts today
    last_log = cache.get(LAST_LOG_KEY)
    now = datetime.now()

    if not last_log or now - last_log > timedelta(days=1):
        # Log all attempts for the past 24 hours
        cache_keys = cache.keys("honeypot_attempt_count_*")
        for key in cache_keys:
            ip = key.split("_")[-1]  # Extract IP from the cache key
            count = cache.get(key, 0)
            if count > 0:
                sentry_sdk.capture_message(
                    f"Daily summary: {count} honeypot login attempts detected from IP: {ip}",
                    level="warning",
                )
                # Reset the count for the IP
                cache.delete(key)

        # Set the last log time
        cache.set(LAST_LOG_KEY, now, CACHE_EXPIRATION)
