from mailchimp_marketing import Client
from mailchimp_marketing.api_client import ApiClientError
from django.shortcuts import render, redirect
from django.core.mail import EmailMessage
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

# from django.core.mail import send_mail
from .forms import ContactForm
from django.conf import settings
import logging
import os

logger = logging.getLogger(__name__)

BOM_SQUAD_EMAIL_ADDRESS = os.environ.get("BOM_SQUAD_EMAIL_ADDRESS")

# Retrieve the environment variable
SPAM_WORDS_STRING = os.environ.get("BANNED_WORDS", "")

# Convert the comma-separated string back to a list
BANNED_WORDS = SPAM_WORDS_STRING.split(",")


# Subscription Logic
def subscribe(email):
    """
    Contains code handling the communication to the mailchimp api
    to create a contact/member in an audience/list.
    """

    # Mailchimp Settings
    api_key = os.getenv("MAILCHIMP_API_KEY")
    server = os.getenv("MAILCHIMP_DATA_CENTER")
    list_id = os.getenv("MAILCHIMP_EMAIL_LIST_ID")

    mailchimp = Client()
    mailchimp.set_config(
        {
            "api_key": api_key,
            "server": server,
        }
    )

    member_info = {
        "email_address": email,
        "status": "subscribed",
    }

    try:
        response = mailchimp.lists.add_list_member(list_id, member_info)
        logger.info("response: {}".format(response))
    except ApiClientError as error:
        logger.warning("An exception occurred: {}".format(error.text))


# Views here.
def subscription(request):
    if request.method == "POST":
        email = request.POST.get("email", "").strip()

        # Validate email
        try:
            validate_email(email)
        except ValidationError:
            logger.warning(f"Invalid email submission: {email}")
            return render(
                request, "contact/subscribe.html", {"error": "Invalid email address."}
            )

        # Attempt subscription
        try:
            subscribe(email)
            logger.info(f"Subscription successful for email: {email}")
            return redirect("success")
        except Exception as e:
            logger.error(
                f"Subscription failed for email: {email}. Error: {e}", exc_info=True
            )
            return render(
                request,
                "contact/subscribe.html",
                {"error": "Subscription failed. Please try again."},
            )

    return render(request, "contact/subscribe.html")


def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)

        # Log incoming request data (excluding sensitive data)
        logger.info(
            f"Processing contact form submission from IP: {request.META.get('REMOTE_ADDR')}"
        )

        if not form.is_valid():
            logger.warning(f"Form validation failed. Errors: {form.errors}")
            return render(request, "contact/index.html", {"form": form})

        if form.is_valid():
            message_content = form.cleaned_data["message"].lower()
            logger.info(f"Message content: {message_content}")

            # Check for spam
            if any(spam_word in message_content for spam_word in BANNED_WORDS):
                logger.warning("Spam detected. Redirecting to spam page.")
                return redirect("spam")

            # Attempt to send email
            try:
                msg = EmailMessage(
                    f"Contact form submission from {form.cleaned_data['name']}",
                    f"Message: {message_content}",
                    settings.CONTACT_EMAIL,
                    [settings.ADMIN_EMAIL],
                )
                msg.send(fail_silently=False)
                logger.info(f"Email successfully sent to {settings.ADMIN_EMAIL}.")
                return redirect("success")
            except Exception as e:
                logger.error(f"Error while sending email: {e}", exc_info=True)
                return redirect("error")
        else:
            logger.debug("Form re-rendered due to unknown reasons.")
            return render(request, "contact/index.html", {"form": form})
    else:
        form = ContactForm()
        logger.debug("Rendering blank contact form.")
    return render(request, "contact/index.html", {"form": form})


def success(request):
    return render(request, "contact/success.html")


def spam(request):
    return render(request, "contact/spam.html")


def error(request):
    return render(request, "contact/error.html")
