from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from accounts.models import CustomUser
from components.models import Component, ComponentSupplierItem, Types, ComponentSupplier
from inventory.models import UserInventory
from unittest.mock import patch


class CreateComponentTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(
            username="testuser",
            password="testpassword",
            email="testuser@example.com",
        )
        self.client.force_login(self.user)
        self.resistor_type = Types.objects.create(name="Resistor")
        self.supplier = ComponentSupplier.objects.create(
            name="Test Supplier",
            short_name="TS",
            url="https://testsupplier.example.com",
        )

    def test_create_component_success(self):
        component_data = {
            "description": "100.0Ω Resistor Resistor",  # Unused in the model, kept for clarity
            "type": str(self.resistor_type.id),  # Use UUID for type
            "ohms": 100,
            "ohms_unit": "Ω",
        }
        supplier_items_data = [
            {
                "supplier": str(self.supplier.id),  # Use UUID for supplier
                "supplier_item_no": "12345",
                "price": 10.00,
                "pcs": 1,
            }
        ]
        quantity = 5

        response = self.client.post(
            reverse("component-create"),
            data={
                "component": component_data,
                "supplier_items": supplier_items_data,
                "quantity": quantity,
            },
            format="json",
        )

        # Generated description
        expected_description = "100.0Ω Resistor Resistor"

        # Assert response for successful creation
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Component.objects.filter(description=expected_description).exists()
        )
        self.assertTrue(
            ComponentSupplierItem.objects.filter(supplier_item_no="12345").exists()
        )
        self.assertTrue(
            UserInventory.objects.filter(
                user=self.user, component__description=expected_description
            ).exists()
        )

    def test_create_component_invalid_component_data(self):
        component_data = {
            "name": "",  # Invalid name
            "type": "Resistor",
        }
        supplier_items_data = []

        response = self.client.post(
            reverse("component-create"),
            data={"component": component_data, "supplier_items": supplier_items_data},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("component_errors", response.data["fieldErrors"])
        self.assertFalse(Component.objects.exists())

    def test_create_component_duplicate_supplier_items(self):
        component_data = {
            "description": "Test Component",
            "type": str(self.resistor_type.id),  # Use UUID for type
            "ohms": 100,
            "ohms_unit": "Ω",
        }
        supplier_items_data = [
            {
                "supplier": str(self.supplier.id),  # Use UUID for supplier
                "supplier_item_no": "12345",
                "price": 10.00,
                "pcs": 1,
            },
            {
                "supplier": str(self.supplier.id),  # Duplicate supplier UUID
                "supplier_item_no": "12345",  # Duplicate item number
                "price": 10.00,
                "pcs": 1,
            },
        ]

        response = self.client.post(
            reverse("component-create"),
            data={"component": component_data, "supplier_items": supplier_items_data},
            format="json",
        )

        # Assert response for duplicate supplier item errors
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("supplier_item_errors", response.data["fieldErrors"])

        self.assertFalse(
            Component.objects.filter(description="Test Component").exists()
        )
        self.assertFalse(
            ComponentSupplierItem.objects.filter(supplier_item_no="12345").exists()
        )

    def test_create_component_invalid_quantity(self):
        component_data = {
            "description": "Test Component",
            "type": "Resistor",
            "ohms": 100,
            "ohms_unit": "Ω",
        }
        supplier_items_data = []
        quantity = 0  # Invalid quantity

        response = self.client.post(
            reverse("component-create"),
            data={
                "component": component_data,
                "supplier_items": supplier_items_data,
                "quantity": quantity,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", response.data["fieldErrors"])
        self.assertFalse(Component.objects.exists())

    def test_create_component_transaction_rollback(self):
        component_data = {
            "description": "Test Component",
            "type": str(self.resistor_type.id),
            "ohms": 100,
            "ohms_unit": "Ω",
        }
        supplier_items_data = [
            {
                "supplier": str(self.supplier.id),
                "supplier_item_no": "12345",
                "price": 10.00,
                "pcs": 1,
            },
        ]

        # Patch the save method of ComponentSupplierItem to raise an exception
        with patch(
            "components.models.ComponentSupplierItem.save",
            side_effect=Exception("Simulated database error"),
        ):
            response = self.client.post(
                reverse("component-create"),
                data={
                    "component": component_data,
                    "supplier_items": supplier_items_data,
                },
                format="json",
            )

        # Assert that the response reflects the rollback error
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn("Transaction failed due to an error", response.data["error"])

        # Assert that no data was saved
        self.assertFalse(Component.objects.exists())
        self.assertFalse(ComponentSupplierItem.objects.exists())

    def test_missing_mandatory_fields(self):
        component_data = {
            # Missing mandatory fields like 'type'
            "ohms": 100,
            "ohms_unit": "Ω",
        }
        supplier_items_data = []

        response = self.client.post(
            reverse("component-create"),
            data={"component": component_data, "supplier_items": supplier_items_data},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("component_errors", response.data["fieldErrors"])
        self.assertFalse(Component.objects.exists())

    def test_empty_supplier_item_list(self):
        component_data = {
            "description": "No Supplier Items",
            "type": str(self.resistor_type.id),
            "ohms": 100,
            "ohms_unit": "Ω",
        }
        supplier_items_data = []  # No supplier items

        response = self.client.post(
            reverse("component-create"),
            data={"component": component_data, "supplier_items": supplier_items_data},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Component.objects.filter(description="No Supplier Items").exists()
        )
        self.assertFalse(ComponentSupplierItem.objects.exists())  # No items saved

    def test_partial_supplier_item_data(self):
        component_data = {
            "description": "Partial Supplier Items",
            "type": str(self.resistor_type.id),
            "ohms": 100,
            "ohms_unit": "Ω",
        }
        supplier_items_data = [
            {
                "supplier": str(self.supplier.id),  # Valid supplier
                # Missing 'supplier_item_no', 'price', or 'pcs'
            }
        ]

        response = self.client.post(
            reverse("component-create"),
            data={"component": component_data, "supplier_items": supplier_items_data},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("supplier_item_errors", response.data["fieldErrors"])
        self.assertFalse(Component.objects.exists())
        self.assertFalse(ComponentSupplierItem.objects.exists())
