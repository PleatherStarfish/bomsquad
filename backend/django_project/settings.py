from pathlib import Path
import socket
import os
import sys
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from storages.backends.s3boto3 import S3Boto3Storage

# =============================================================================
# BASE SETTINGS
# =============================================================================

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-SECRET_KEY
SECRET_KEY = os.environ.get("SECRET_KEY")

# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = os.environ.get("DEBUG") == "True"

# https://docs.djangoproject.com/en/dev/ref/settings/#allowed-hosts
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")
# ALLOWED_HOSTS = ["*"]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost",
    "http://0.0.0.0",
    "http://127.0.0.1",
    "https://134.209.65.8",
    "https://bom-squad.com",
    "https://dev.bom-squad.com",
]

# Base settings
BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = os.environ.get("SECRET_KEY")
DEBUG = os.environ.get("DEBUG") == "True"

# =============================================================================
# STATIC & MEDIA FILES
# =============================================================================

if DEBUG:
    STATIC_URL = "/static/"
    STATICFILES_DIRS = [BASE_DIR / "static"]
    STATIC_ROOT = BASE_DIR / "staticfiles"
    STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"
    MEDIA_URL = "/media/"
    MEDIA_ROOT = os.path.join(BASE_DIR, "media")
    WHITENOISE_MANIFEST_STRICT = False
else:
    # Production settings
    AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
    AWS_STORAGE_BUCKET_NAME = os.environ.get("AWS_STORAGE_BUCKET_NAME")
    AWS_S3_ENDPOINT_URL = os.environ.get("AWS_S3_ENDPOINT_URL")
    AWS_S3_OBJECT_PARAMETERS = {
        "CacheControl": "max-age=86400",
    }
    AWS_S3_REGION_NAME = os.environ.get("AWS_S3_REGION_NAME", "nyc3")
    AWS_DEFAULT_ACL = os.environ.get("AWS_DEFAULT_ACL")
    AWS_S3_CUSTOM_DOMAIN = os.environ.get("AWS_S3_CUSTOM_DOMAIN")

    # Separate locations for static and media files
    STATIC_LOCATION = "static"
    MEDIA_LOCATION = "media"

    # Static files settings
    STATIC_URL = f"{AWS_S3_CUSTOM_DOMAIN}/{STATIC_LOCATION}/"
    STATICFILES_STORAGE = "custom_storages.StaticStorage"

    # Media files settings
    MEDIA_URL = f"{AWS_S3_CUSTOM_DOMAIN}/{MEDIA_LOCATION}/"
    DEFAULT_FILE_STORAGE = "custom_storages.MediaStorage"

    # Ensure these are set for collectstatic to find files
    STATICFILES_DIRS = [BASE_DIR / "static"]
    STATIC_ROOT = BASE_DIR / "staticfiles"

# =============================================================================
# APPLICATION DEFINITION
# =============================================================================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django_comments_xtd",
    "django_comments",
    "django_editorjs_fields",
    "django_otp",
    "django_otp.plugins.otp_totp",
    "whitenoise.runserver_nostatic",
    "core.staticfiles_config.StaticFilesConfig",
    "django.contrib.sitemaps",
    "django.contrib.sites",
    # Third-party
    "analytical",
    "maintenance_mode",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.google",
    "allauth.socialaccount.providers.discord",
    "captcha",
    "crispy_forms",
    "crispy_tailwind",
    "rest_framework",
    "drf_yasg",  # Swagger
    "admin_honeypot",
    "corsheaders",
    "djmoney",
    "django_mptt_admin",
    "mptt",
    "import_export",
    "storages",
    # Local
    "accounts",
    "blog",
    "contact",
    "core",
    "pages",
    "modules",
    "components",
    "inventory",
    "shopping_list",
    "widget_tweaks",
    "comments",
]

# =============================================================================
# MIDDLEWARE (Order Sensitive)
# =============================================================================

MIDDLEWARE = [
    "django.middleware.gzip.GZipMiddleware",
    "htmlmin.middleware.HtmlMinifyMiddleware",
    "htmlmin.middleware.MarkRequestMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    # "debug_toolbar.middleware.DebugToolbarMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "maintenance_mode.middleware.MaintenanceModeMiddleware",
    "django_otp.middleware.OTPMiddleware",
]

# =============================================================================
# CORS CONFIGURATION
# =============================================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://134.209.65.8",
    "https://bom-squad.com",
    "https://dev.bom-squad.com",
]
CORS_ALLOW_METHODS = ["DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT"]
CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]
CORS_ALLOW_CREDENTIALS = True

# =============================================================================
# REST FRAMEWORK CONFIGURATION
# =============================================================================

REST_FRAMEWORK = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "1000/hour", "user": "10000/hour"},
}

# =============================================================================
# MISCELLANEOUS SETTINGS
# =============================================================================

MATOMO_SITE_ID = 1
MATOMO_DOMAIN_PATH = "matomo.bom-squad.com"
LOGIN_REDIRECT_URL = "/patchbay/"
ADMIN_HONEYPOT_EMAIL_ADMINS = True

# =============================================================================
# URLS & TEMPLATES
# =============================================================================

ROOT_URLCONF = "django_project.urls"
WSGI_APPLICATION = "django_project.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
                "core.context_processors.mixpanel_token",
                "core.context_processors.meta_context",
            ],
        },
    },
]

# =============================================================================
# DATABASE CONFIGURATION
# =============================================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME"),
        "USER": os.environ.get("DB_USER"),
        "PASSWORD": os.environ.get("DB_PASSWORD"),
        "HOST": os.environ.get("DB_HOST"),
        "PORT": os.environ.get("DB_PORT"),
    }
}

# =============================================================================
# PASSWORD VALIDATION
# =============================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"
    },
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# =============================================================================
# THIRD-PARTY & APP-SPECIFIC SETTINGS
# =============================================================================

EDITORJS_VERSION = "latest"
OPENEXCHANGERATES_APP_ID = os.getenv("OPENEXCHANGERATES_APP_ID")

# =============================================================================
# INTERNATIONALIZATION
# =============================================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_L10N = True
USE_TZ = True

# =============================================================================
# COMMENTS CONFIGURATION
# =============================================================================

COMMENTS_APP = "django_comments_xtd"
COMMENTS_XTD_CONFIRM_EMAIL = False
COMMENTS_XTD_THREADED_EMAILS = False
COMMENTS_XTD_MAX_THREAD_LEVEL = 1
COMMENTS_XTD_APP_MODEL_OPTIONS = {
    "default": {
        "allow_flagging": False,
        "allow_feedback": False,
        "show_feedback": False,
        "who_can_post": "users",
    }
}

# =============================================================================
# DEFAULT AUTO FIELD
# =============================================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =============================================================================
# CRISPY FORMS
# =============================================================================

CRISPY_ALLOWED_TEMPLATE_PACKS = "tailwind"
CRISPY_TEMPLATE_PACK = "tailwind"

# =============================================================================
# EMAIL CONFIGURATION
# =============================================================================

EMAIL_BACKEND = "core.email.SendgridEmailBackend"
DEFAULT_FROM_EMAIL = "noreply@bom-squad.com"
CONTACT_EMAIL = os.environ.get("BOM_SQUAD_EMAIL_ADDRESS")
ADMIN_EMAIL = os.environ.get("BOM_SQUAD_EMAIL_ADDRESS")
SENDGRID_API_KEY = os.environ.get("SENDGRID_API_KEY")
EMAIL_HOST = "smtp.sendgrid.net"
EMAIL_HOST_USER = "apikey"
EMAIL_HOST_PASSWORD = SENDGRID_API_KEY
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# =============================================================================
# DEBUG TOOLBAR & INTERNAL IPS
# =============================================================================

hostname, _, ips = socket.gethostbyname_ex(socket.gethostname())
INTERNAL_IPS = [ip[:-1] + "1" for ip in ips]

# =============================================================================
# CUSTOM USER MODEL
# =============================================================================

AUTH_USER_MODEL = "accounts.CustomUser"

# =============================================================================
# SOCIAL ACCOUNT PROVIDERS
# =============================================================================

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": ["profile", "email"],
        "AUTH_PARAMS": {"access_type": "online"},
        "OAUTH_PKCE_ENABLED": True,
    }
}

# =============================================================================
# TEST SETTINGS
# =============================================================================

if "test" in sys.argv:
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# =============================================================================
# RECAPTCHA CONFIGURATION
# =============================================================================

RECAPTCHA_PRIVATE_KEY = os.environ.get("RECAPTCHA_PRIVATE_KEY")
RECAPTCHA_PUBLIC_KEY = os.environ.get("RECAPTCHA_PUBLIC_KEY")

# =============================================================================
# DJANGO-ALLAUTH CONFIGURATION
# =============================================================================

SITE_ID = 1
APPEND_SLASH = True
LOGIN_REDIRECT_URL = "home"
ACCOUNT_LOGOUT_REDIRECT_URL = "home"

AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

SOCIALACCOUNT_QUERY_EMAIL = True
ACCOUNT_SESSION_REMEMBER = True
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_CONFIRM_EMAIL_ON_GET = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_LOGIN_ON_EMAIL_CONFIRMATION = True
ACCOUNT_LOGOUT_ON_GET = True
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_SIGNUP_PASSWORD_ENTER_TWICE = True
ACCOUNT_UNIQUE_EMAIL = True
ACCOUNT_EMAIL_CONFIRMATION_EXPIRE_DAYS = 1
ACCOUNT_MAX_EMAIL_ADDRESSES = 3
ACCOUNT_USER_MODEL_EMAIL_FIELD = "email"
ACCOUNT_FORMS = {
    "signup": "accounts.forms.CustomUserCreationForm",
    "reset_password": "accounts.forms.CaptchaPasswordResetForm",
}
ACCOUNT_DEFAULT_HTTP_PROTOCOL = os.environ.get("ACCOUNT_DEFAULT_HTTP_PROTOCOL")
SOCIALACCOUNT_LOGIN_ON_GET = True

# =============================================================================
# TINYMCE CONFIGURATION
# =============================================================================

TINYMCE_DEFAULT_CONFIG = {
    "theme": "silver",
    "height": 500,
    "menubar": True,
    "plugins": (
        "advlist,autolink,lists,link,image,charmap,print,preview,anchor,"
        "searchreplace,visualblocks,code,fullscreen,insertdatetime,media,table,paste,"
        "code,help,wordcount"
    ),
    "toolbar": (
        "undo redo | formatselect | bold italic backcolor | link | "
        "alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | "
        "removeformat | help"
    ),
}

# =============================================================================
# SENTRY CONFIGURATION
# =============================================================================

sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    integrations=[DjangoIntegration()],
    traces_sample_rate=1.0,
    send_default_pii=False,
)

# =============================================================================
# LOGGING CONFIGURATION
# =============================================================================

LOG_DIR = os.path.join(os.path.dirname(BASE_DIR), "log")
os.makedirs(LOG_DIR, exist_ok=True)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "simple": {"format": "{levelname} {message}", "style": "{"},
    },
    "handlers": {
        "file": {
            "level": "DEBUG",
            "class": "logging.FileHandler",
            "filename": os.path.join(LOG_DIR, "django.log"),
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {"handlers": ["file"], "level": "DEBUG", "propagate": True},
    },
}

# =============================================================================
# MAINTENANCE MODE
# =============================================================================

MAINTENANCE_MODE_TEMPLATE = "503.html"

# =============================================================================
# CURRENCY SETTINGS
# =============================================================================

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

CURRENCY_CHOICES = [
    ("USD", "US Dollar ($)"),
    ("EUR", "Euro (€)"),
    ("JPY", "Japanese Yen (¥)"),
    ("GBP", "British Pound (£)"),
    ("AUD", "Australian Dollar (A$)"),
    ("CAD", "Canadian Dollar (C$)"),
    ("CHF", "Swiss Franc (Fr.)"),
    ("CNY", "Chinese Yuan (¥)"),
    ("HKD", "Hong Kong Dollar (HK$)"),
    ("NZD", "New Zealand Dollar (NZ$)"),
    ("SEK", "Swedish Krona (kr)"),
    ("KRW", "South Korean Won (₩)"),
    ("SGD", "Singapore Dollar (S$)"),
    ("NOK", "Norwegian Krone (kr)"),
    ("INR", "Indian Rupee (₹)"),
]
