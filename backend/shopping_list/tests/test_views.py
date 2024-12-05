import uuid
from rest_framework import status
from django.contrib.auth import get_user_model
from shopping_list.models import UserShoppingList
from components.models import (
    Category,
    Component,
    ComponentManufacturer,
    Types,
    ComponentSupplierItem,
    ComponentSupplier,
)
from modules.models import Module, ModuleBomListItem, Manufacturer
from rest_framework.test import APITestCase, APIClient
from django.core.exceptions import ValidationError
from django.urls import reverse
from decimal import Decimal, ROUND_HALF_UP


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


# Url: /api/shopping-list/total-quantity/
# Frontend: useGetUserShoppingListTotalQuantity.ts
class GetUserShoppingListTotalQuantityTests(APITestCase):
    def setUp(self):
        # Set up test user and authenticate
        self.user = self.user = User.objects.create_user(
            username="testuser", password="password"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create necessary related models
        self.manufacturer = ComponentManufacturer.objects.create(
            name="Test Manufacturer"
        )
        self.type_resistor = Types.objects.create(name="Resistor")
        self.category = Category.objects.create(name="Passive Components")

        # Create unique components
        self.resistor1 = Component.objects.create(
            description="10kΩ Resistor",
            manufacturer=self.manufacturer,
            type=self.type_resistor,
            category=self.category,
            ohms=10.0,
            ohms_unit="kΩ",
        )
        self.resistor2 = Component.objects.create(
            description="22kΩ Resistor",
            manufacturer=self.manufacturer,
            type=self.type_resistor,
            category=self.category,
            ohms=22.0,
            ohms_unit="kΩ",
        )

        # Create shopping list items with unique components
        self.item1 = UserShoppingList.objects.create(
            user=self.user, component=self.resistor1, quantity=5
        )
        self.item2 = UserShoppingList.objects.create(
            user=self.user, component=self.resistor2, quantity=10
        )

    def test_user_not_authenticated(self):
        self.client.logout()
        response = self.client.get("/api/shopping-list/total-quantity/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(
            response.data["detail"], "Authentication credentials were not provided."
        )

    def test_no_shopping_list_items(self):
        UserShoppingList.objects.filter(user=self.user).delete()
        response = self.client.get("/api/shopping-list/total-quantity/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_total_quantity_calculation(self):
        response = self.client.get("/api/shopping-list/total-quantity/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_quantity"], 15)

    def test_archived_items_excluded(self):
        from shopping_list.models import UserShoppingListSaved

        UserShoppingListSaved.objects.create(
            user=self.user, component=self.resistor1, quantity=self.item1.quantity
        )
        self.item1.delete()

        response = self.client.get("/api/shopping-list/total-quantity/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_quantity"], 10)

    def test_validation_for_quantity(self):
        """Ensure validation prevents negative or zero quantities."""
        self.item1.quantity = 0
        with self.assertRaises(ValidationError):
            self.item1.full_clean()

    def test_component_hierarchy_support(self):
        """Test total quantity calculation for components in a hierarchical category."""
        sub_category = Category.objects.create(name="Resistors", parent=self.category)
        self.resistor1.category = sub_category
        self.resistor1.save()

        response = self.client.get("/api/shopping-list/total-quantity/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_quantity"], 15)


class GetUserShoppingListTotalComponentPriceTestCase(APITestCase):
    def setUp(self):
        """
        Set up test data for all tests:
        - Create a user and authenticate them.
        - Create a component to test against.
        - Add shopping list items for the user with a specific component.
        - Add supplier items linked to the component for price calculations.
        """
        # Create a user
        self.user = User.objects.create_user(
            username="testuser", password="password123"
        )
        self.client.login(username="testuser", password="password123")

        # Create a supplier
        self.supplier_1 = ComponentSupplier.objects.create(
            name="Supplier 1", short_name="S1", url="https://supplier1.com"
        )
        self.supplier_2 = ComponentSupplier.objects.create(
            name="Supplier 2", short_name="S2", url="https://supplier2.com"
        )

        # Create a component type and component
        self.component_type = Types.objects.create(name="Resistor")
        self.component = Component.objects.create(
            description="Test Component",
            type=self.component_type,
            unit_price=10,
        )

        # Create shopping list items for the user
        self.shopping_list_item = UserShoppingList.objects.create(
            user=self.user, component=self.component, quantity=5
        )

        # Create supplier items
        self.supplier_item_1 = ComponentSupplierItem.objects.create(
            component=self.component,
            supplier=self.supplier_1,
            price=5,
            pcs=10,
        )
        self.supplier_item_2 = ComponentSupplierItem.objects.create(
            component=self.component,
            supplier=self.supplier_2,
            price=6,
            pcs=12,
        )

        # URL for the endpoint
        self.url = reverse(
            "user-shopping-list-total-price",
            kwargs={"component_pk": self.component.pk},
        )

    def test_component_not_found(self):
        """
        Test the case where the component does not exist.
        - Endpoint should return a 404 status.
        - Response should include an appropriate error message.
        """
        non_existent_component_pk = uuid.uuid4()
        response = self.client.get(
            reverse(
                "user-shopping-list-total-price",
                kwargs={"component_pk": non_existent_component_pk},
            )
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "Component not found.")

    def test_no_shopping_list_items(self):
        """
        Test the case where the user has no shopping list items for the given component.
        - Endpoint should return a 404 status.
        - Response should include an appropriate error message.
        """
        UserShoppingList.objects.all().delete()  # Remove shopping list items
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            response.data["detail"],
            "No shopping list items found for the specified component.",
        )

    def test_successful_response(self):
        """
        Test the case where the data exists, and calculations are correct:
        - Endpoint should return a 200 status.
        - Response should include accurate total_min_price, total_max_price, and total_price.
        """
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Calculate expected results
        total_quantity = self.shopping_list_item.quantity
        total_min_price = total_quantity * self.supplier_item_1.price.amount
        total_max_price = total_quantity * self.supplier_item_2.price.amount
        deprecated_total_price = total_quantity * self.component.unit_price

        # Assert response data
        self.assertEqual(response.data["total_min_price"], total_min_price)
        self.assertEqual(response.data["total_max_price"], total_max_price)
        self.assertEqual(response.data["total_price"], deprecated_total_price)

    def test_unauthenticated_request(self):
        """
        Test the case where the user is not authenticated.
        - Endpoint should return a 403 status.
        - Response should indicate that authentication is required.
        """
        self.client.logout()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_no_supplier_items(self):
        """
        Test when no supplier items are linked to the component.
        - Total prices should be 0.
        """
        ComponentSupplierItem.objects.filter(
            component=self.component
        ).delete()  # Remove supplier items
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_min_price"], 0)
        self.assertEqual(response.data["total_max_price"], 0)

    def test_zero_quantity(self):
        """
        Test when shopping list items exist but have zero quantity.
        - Total prices should be 0.
        """
        self.shopping_list_item.quantity = 0
        self.shopping_list_item.save()
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_min_price"], 0)
        self.assertEqual(response.data["total_max_price"], 0)
        self.assertEqual(response.data["total_price"], 0)

    def test_mixed_supplier_item_prices(self):
        """Test when supplier items have extreme price variations."""
        supplier1 = ComponentSupplier.objects.create(
            name="Supplier 1", short_name="S1", url="https://example.com"
        )
        supplier2 = ComponentSupplier.objects.create(
            name="Supplier 2", short_name="S2", url="https://example.com"
        )
        ComponentSupplierItem.objects.create(
            component=self.component, supplier=supplier1, price=Decimal("0.10"), pcs=1
        )
        ComponentSupplierItem.objects.create(
            component=self.component,
            supplier=supplier2,
            price=Decimal("1000.00"),
            pcs=1,
        )
        response = self.client.get(
            f"/api/shopping-list/total-component-price/?component_id={self.component.id}"
        )
        self.assertEqual(response.status_code, 200)
        # Add assertions for price calculations

    def test_multiple_shopping_list_items(self):
        """
        Test when multiple shopping list items exist for the same user and component.
        - Verify aggregated quantities are used.
        """
        UserShoppingList.objects.create(
            user=self.user, component=self.component, quantity=3
        )
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        total_quantity = 5 + 3  # Combined quantity
        total_min_price = total_quantity * self.supplier_item_1.price.amount
        total_max_price = total_quantity * self.supplier_item_2.price.amount
        self.assertEqual(response.data["total_min_price"], total_min_price)
        self.assertEqual(response.data["total_max_price"], total_max_price)

    def test_integer_unit_prices_and_quantities_no_rounding(self):
        """
        Test when supplier items and shopping list quantities involve integers.
        - Verify accurate calculation of totals without applying rounding.
        """
        # Setup
        self.shopping_list_item.quantity = 3
        self.shopping_list_item.save()

        # Set unit prices for supplier items
        self.supplier_item_1.unit_price = Decimal("3.75")  # Cheapest supplier
        self.supplier_item_2.unit_price = Decimal("4.50")  # Expensive supplier
        self.supplier_item_1.save()
        self.supplier_item_2.save()

        # Expected values
        total_quantity = self.shopping_list_item.quantity
        expected_totals = {
            "total_min_price": str(
                total_quantity * self.supplier_item_1.unit_price
            ),  # 3 * 3.75 = 11.25
            "total_max_price": str(
                total_quantity * self.supplier_item_2.unit_price
            ),  # 3 * 4.50 = 13.50
        }

        # Call the endpoint
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Parse and compare results
        response_totals = {
            "total_min_price": response.data["total_min_price"],
            "total_max_price": response.data["total_max_price"],
        }
        self.assertEqual(response_totals, expected_totals)  # Should now match
