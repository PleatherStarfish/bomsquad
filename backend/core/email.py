import os
from django.core.mail.backends.base import BaseEmailBackend
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail


class SendgridEmailBackend(BaseEmailBackend):
    def send_messages(self, email_messages):
        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        for message in email_messages:
            mail = Mail(
                from_email=message.from_email,
                to_emails=message.to,
                subject=message.subject,
                html_content=message.body,
            )
            sg.send(mail)
