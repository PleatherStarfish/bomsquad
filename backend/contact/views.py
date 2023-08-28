from mailchimp_marketing import Client
from mailchimp_marketing.api_client import ApiClientError
from django.shortcuts import render, redirect
from django.core.mail import EmailMessage

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
        email = request.POST["email"]
        subscribe(email)
        return redirect("thanks_for_subscribing")


def contact(request):
    if request.method == "POST":
        form = ContactForm(request.POST)

        if form.is_valid():
            # Check for spam words
            message_content = form.cleaned_data["message"].lower()
            if any(spam_word in message_content for spam_word in BANNED_WORDS):
                return redirect("spam")

            name = form.cleaned_data["name"]
            email = form.cleaned_data["email"]
            message = form.cleaned_data["message"]
            msg_body = f"Message from {name} ({email}):\n\n{message}"

            msg = EmailMessage(
                f"Contact form submission from {name}",
                msg_body,
                settings.CONTACT_EMAIL,
                [settings.ADMIN_EMAIL],
            )

            msg.send(fail_silently=False)

            return redirect("success")
    else:
        form = ContactForm()

    return render(request, "contact/index.html", {"form": form})
