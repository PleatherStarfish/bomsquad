from django.test import TestCase, Client, override_settings
from django.urls import reverse
from unittest.mock import patch, MagicMock
import logging

logger = logging.getLogger(__name__)


class ContactViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.contact_url = reverse("contact")
        self.success_url = reverse("success")
        self.error_url = reverse("error")
        self.spam_url = reverse("spam")
        self.valid_form_data = {
            "name": "Test User",
            "email": "testuser@example.com",
            "message": "This is a valid message.",
            "captcha": "PASSED",  # Mock value
        }
        self.invalid_form_data = {
            "name": "",
            "email": "invalidemail",
            "message": "",
            "captcha": "PASSED",  # Mock value
        }
        self.spam_form_data = {
            "name": "Spam User",
            "email": "spamuser@example.com",
            "message": "This contains guaranteed earnings.",
            "captcha": "PASSED",  # Mock value
        }

    @override_settings(
        CONTACT_EMAIL="contact@example.com",
        ADMIN_EMAIL="admin@example.com",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    @patch("contact.forms.ReCaptchaField.validate")
    def test_valid_contact_form_submission(self, mock_validate):
        """Test valid form submission sends an email and redirects to success."""
        mock_validate.return_value = True
        response = self.client.post(self.contact_url, self.valid_form_data)
        self.assertRedirects(response, self.success_url)

    @override_settings(
        CONTACT_EMAIL="contact@example.com",
        ADMIN_EMAIL="admin@example.com",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    @patch("contact.forms.ReCaptchaField.validate")
    @patch("django.core.mail.EmailMessage.send")
    def test_email_send_failure(self, mock_send, mock_validate):
        """Test email sending failure is handled gracefully."""
        mock_validate.return_value = True
        mock_send.side_effect = Exception("SMTP error")
        response = self.client.post(self.contact_url, self.valid_form_data)
        self.assertRedirects(response, self.error_url)

    @override_settings(
        CONTACT_EMAIL="contact@example.com",
        ADMIN_EMAIL="admin@example.com",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    @patch("contact.forms.ReCaptchaField.validate")
    def test_invalid_contact_form_submission(self, mock_validate):
        """Test invalid form submission does not send an email."""
        mock_validate.return_value = True
        response = self.client.post(self.contact_url, self.invalid_form_data)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "contact/index.html")
        self.assertIn("name", response.context["form"].errors)
        self.assertIn("email", response.context["form"].errors)
        self.assertIn("message", response.context["form"].errors)

    @override_settings(
        CONTACT_EMAIL="contact@example.com",
        ADMIN_EMAIL="admin@example.com",
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
    )
    @patch("contact.forms.ReCaptchaField.validate")
    @patch("contact.views.BANNED_WORDS", ["guaranteed", "earnings", "bonus"])
    def test_spam_detection_redirects_to_spam_page(self, mock_validate):
        """Test messages containing banned words are detected as spam."""
        mock_validate.return_value = True
        response = self.client.post(self.contact_url, self.spam_form_data)
        self.assertRedirects(response, self.spam_url)


class SubscriptionViewTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.subscription_url = reverse("subscription")
        self.success_url = reverse("success")
        self.valid_email = "valid@example.com"
        self.invalid_email = ""  # Simulates missing email

    @patch("contact.views.subscribe")
    def test_valid_subscription(self, mock_subscribe):
        """Test that a valid email triggers the subscribe function and redirects."""
        response = self.client.post(self.subscription_url, {"email": self.valid_email})
        self.assertRedirects(response, self.success_url)
        mock_subscribe.assert_called_once_with(self.valid_email)

    @patch("contact.views.subscribe")
    def test_invalid_subscription(self, mock_subscribe):
        """Test that an invalid email does not trigger the subscribe function."""
        response = self.client.post(
            self.subscription_url, {"email": self.invalid_email}
        )
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, "contact/subscribe.html")
        self.assertIn("Invalid email address.", response.context["error"])
        mock_subscribe.assert_not_called()

    @patch("contact.views.Client")
    def test_mailchimp_api_error(self, mock_mailchimp_client):
        """Test that an API error from Mailchimp is logged."""
        mock_mailchimp = MagicMock()
        mock_mailchimp.lists.add_list_member.side_effect = Exception("API Error")
        mock_mailchimp_client.return_value = mock_mailchimp

        with self.assertLogs(logger, level="WARNING") as log:
            response = self.client.post(
                self.subscription_url, {"email": self.valid_email}
            )
            self.assertRedirects(response, self.success_url)
            self.assertIn("An exception occurred", log.output[0])
