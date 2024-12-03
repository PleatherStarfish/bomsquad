from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import CustomUser
from allauth.account.models import EmailAddress
from modules.models import Manufacturer, WantToBuildModules, BuiltModules, Module
from accounts.models import UserNotes
from uuid import uuid4


class GetUserMeSimpleTest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = CustomUser.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="testpassword",
        )
        # Add a verified primary email for the user
        EmailAddress.objects.create(
            user=self.user, email="testuser@example.com", verified=True, primary=True
        )
        self.client = APIClient()
        self.url = "/api/get-user-me/"

    def test_authenticated_access(self):
        """
        Ensure an authenticated user can access the endpoint and retrieve their primary email.
        """
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["email"], "testuser@example.com")

    def test_unauthenticated_access(self):
        """
        Ensure the endpoint returns a 401 status for unauthenticated users.
        """
        response = self.client.get(self.url, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 401)
        self.assertEqual(
            response.json()["detail"],
            "Authentication credentials were not provided or are invalid.",
        )

    def test_multiple_emails(self):
        """
        Ensure the endpoint correctly handles users with multiple email addresses.
        """
        # Add an additional email for the user
        EmailAddress.objects.create(
            user=self.user,
            email="testuser+alt@example.com",
            verified=False,
            primary=False,
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url, HTTP_ACCEPT="application/json")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["email"], "testuser@example.com")  # Primary email
        self.assertIn("emails", data)
        self.assertEqual(len(data["emails"]), 2)

        # Verify primary email
        primary_email = next(email for email in data["emails"] if email["primary"])
        self.assertEqual(primary_email["email"], "testuser@example.com")
        self.assertTrue(primary_email["verified"])

        # Verify secondary email
        alt_email = next(
            email
            for email in data["emails"]
            if email["email"] == "testuser+alt@example.com"
        )
        self.assertFalse(alt_email["verified"])
        self.assertFalse(alt_email["primary"])


class UserNotesViewTest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = CustomUser.objects.create_user(
            username="testuser", email="testuser@example.com", password="testpassword"
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create a manufacturer
        self.manufacturer = Manufacturer.objects.create(name="Test Manufacturer")

        # Create sample modules
        self.module1 = Module.objects.create(
            name="Module 1", manufacturer=self.manufacturer
        )
        self.module2 = Module.objects.create(
            name="Module 2", manufacturer=self.manufacturer
        )

        # Create WantToBuildModules and BuiltModules
        self.want_to_build = WantToBuildModules.objects.create(
            module=self.module1, user=self.user
        )
        self.built = BuiltModules.objects.create(module=self.module2, user=self.user)

        # Create a note
        self.note = UserNotes.objects.create(
            note="Test Note", want_to_build_module=self.want_to_build
        )

        # Endpoints
        self.get_note_url = f"/api/user-notes/want-to-build/{self.module1.id}/"
        self.post_note_url = f"/api/user-notes/want-to-build/{self.module1.id}/"
        self.put_note_url = f"/api/user-notes/{self.note.id}/"
        self.delete_note_url = f"/api/user-notes/want-to-build/{self.module1.id}/"

    def test_get_note_success(self):
        """
        Test retrieving a note for a module the user owns.
        """
        response = self.client.get(self.get_note_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["note"], "Test Note")

    def test_get_note_not_found(self):
        """
        Test retrieving a note for a non-existent module.
        """
        url = f"/api/user-notes/want-to-build/{uuid4()}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_note_success(self):
        """
        Test creating a new note for a module.
        """
        data = {"module_id": str(self.module2.id), "note": "New Note"}
        response = self.client.post(self.post_note_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["note"], "New Note")

    def test_post_note_module_not_found(self):
        """
        Test creating a note for a non-existent module.
        """
        data = {"module_id": str(uuid4()), "note": "Note for missing module"}
        response = self.client.post(self.post_note_url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_put_note_success(self):
        data = {"note": "Updated Note"}
        url = f"/api/user-notes/{self.note.pk}/"
        response = self.client.put(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["note"], "Updated Note")

    def test_put_note_not_found(self):
        """
        Test updating a non-existent note.
        """
        url = f"/api/user-notes/{uuid4()}/"
        data = {"note": "Should fail"}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_note_success(self):
        """
        Test deleting an existing note.
        """
        response = self.client.delete(self.delete_note_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserNotes.objects.filter(id=self.note.id).exists())

    def test_delete_note_not_found(self):
        # Use an invalid UUID for the module
        url = f"/api/user-notes/want-to-build/{uuid4()}/"
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
