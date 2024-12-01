from rest_framework import status
from django.contrib.auth import get_user_model
from shopping_list.models import UserShoppingList
from components.models import Component, ComponentManufacturer, Types
from modules.models import Module, ModuleBomListItem, Manufacturer
from rest_framework.test import APITestCase, APIClient
from django.urls import reverse


User = get_user_model()


# Url: /api/shopping-list/<uuid:component_pk>/<uuid:modulebomlistitem_pk>/<uuid:module_pk>/component-quantity/
# Frontend: useGetUserShoppingListQuantity.ts
class GetUserShoppingListQuantityTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a user and authenticate
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.login(username="testuser", password="password")

        # Create the required manufacturers
        self.module_manufacturer = Manufacturer.objects.create(
            name="Module Manufacturer"
        )
        self.component_manufacturer = ComponentManufacturer.objects.create(
            name="Component Manufacturer"
        )

        # Create a Module using the correct Manufacturer
        self.module = Module.objects.create(
            name="Test Module",
            manufacturer=self.module_manufacturer,
        )

        # Create other related objects
        self.component_type = Types.objects.create(name="Resistor")
        self.component = Component.objects.create(
            description="Test Resistor",
            manufacturer=self.component_manufacturer,
            type=self.component_type,
            ohms=100.0,
            ohms_unit="Ω",
            mounting_style="th",
        )
        self.bom_item = ModuleBomListItem.objects.create(
            description="Test BOM Item", module=self.module, type=self.component_type
        )

        # Create a UserShoppingList entry
        self.shopping_list_item = UserShoppingList.objects.create(
            component=self.component,
            module=self.module,
            bom_item=self.bom_item,
            user=self.user,
            quantity=10,
        )

    def test_shopping_list_quantity_exists(self):
        url = reverse(
            "user-shopping-list",
            kwargs={
                "component_pk": str(self.component.pk),
                "modulebomlistitem_pk": str(self.bom_item.pk),
                "module_pk": str(self.module.pk),
            },
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("quantity", response.json())
        self.assertEqual(response.json()["quantity"], 10)

    def test_shopping_list_quantity_not_exists(self):
        """
        Test the endpoint returns quantity 0 for a non-existing shopping list item.
        """
        url = reverse(
            "user-shopping-list",
            kwargs={
                "component_pk": "e3999dd0-0c54-4b5d-9c6d-28e2f50b1ef7",
                "modulebomlistitem_pk": str(self.bom_item.pk),
                "module_pk": str(self.module.pk),
            },
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 0)

    def test_invalid_user_access(self):
        """
        Test the endpoint returns a 401 error for unauthenticated access.
        """
        self.client.logout()  # Ensure unauthenticated access
        url = reverse(
            "user-shopping-list",
            kwargs={
                "component_pk": str(self.component.pk),
                "modulebomlistitem_pk": str(self.bom_item.pk),
                "module_pk": str(self.module.pk),
            },
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, 403)

    def test_invalid_parameters(self):
        """
        Test the endpoint handles invalid parameters gracefully.
        """
        url = reverse(
            "user-shopping-list",
            kwargs={
                "component_pk": "e3999dd0-0c54-4b5d-9c6d-28e2f50b1ef7",
                "modulebomlistitem_pk": "f0a9cd51-974a-488c-93df-5f024c1a295a",
                "module_pk": "b5c1adff-9f63-4516-87e7-93cc032c3cf9",
            },
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 0)


# Url: /api/shopping-list/unique-components/
# Frontend: useGetAllUniqueComponentIds.tsx
class GetAllUniqueComponentIdsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a user and authenticate
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.login(username="testuser", password="password")

        # Create manufacturers and types
        self.module_manufacturer = Manufacturer.objects.create(
            name="Module Manufacturer"
        )
        self.component_manufacturer = ComponentManufacturer.objects.create(
            name="Component Manufacturer"
        )
        self.type_resistor = Types.objects.create(name="Resistor")
        self.type_capacitor = Types.objects.create(name="Capacitor")

        # Create components
        self.component1 = Component.objects.create(
            description="Component 1",
            manufacturer=self.component_manufacturer,
            type=self.type_resistor,
        )
        self.component2 = Component.objects.create(
            description="Component 2",
            manufacturer=self.component_manufacturer,
            type=self.type_capacitor,
        )

        # Create a module
        self.module = Module.objects.create(
            name="Test Module", manufacturer=self.module_manufacturer
        )

        # Create BOM items
        self.bom_item1 = ModuleBomListItem.objects.create(
            description="BOM Item 1", module=self.module, type=self.type_resistor
        )

        # Add components to the user's shopping list
        UserShoppingList.objects.create(
            user=self.user,
            component=self.component1,
            module=self.module,
            bom_item=self.bom_item1,
            quantity=5,
        )
        UserShoppingList.objects.create(
            user=self.user,
            component=self.component2,
            module=self.module,
            bom_item=self.bom_item1,
            quantity=10,
        )

    def test_get_all_unique_component_ids(self):
        """
        Test the endpoint returns all unique component IDs for the authenticated user.
        """
        url = reverse("unique-components")
        response = self.client.get(url)

        # Expected response as a list of strings
        expected_ids = [
            str(self.component1.id),
            str(self.component2.id),
        ]

        # Sort both lists to ensure consistent comparison
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(sorted(response.data), sorted(expected_ids))

    def test_get_all_unique_component_ids_empty(self):
        """
        Test the endpoint returns an empty list if the user has no shopping list items.
        """
        # Clear the shopping list for the user
        UserShoppingList.objects.filter(user=self.user).delete()

        url = reverse("unique-components")
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_get_all_unique_component_ids_unauthenticated(self):
        """
        Test the endpoint returns 401 Unauthorized for unauthenticated access.
        """
        self.client.logout()  # Logout the user
        url = reverse("unique-components")
        response = self.client.get(url)

        self.assertEqual(response.status_code, 403)
