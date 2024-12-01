import uuid
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from inventory.models import UserInventory
from modules.models import ModuleBomListItem, Module, Manufacturer
from components.models import Component, Types, ComponentManufacturer
from django.contrib.auth import get_user_model
from uuid import uuid4

User = get_user_model()


# Url: inventory/bom-list-item/<uuid:modulebomlistitem_pk>/aggregate-sum/
# Frontend: unused?
class GetUserInventoryQuantitiesForBomListItemTests(APITestCase):
    def setUp(self):
        # Create a test user and authenticate
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create a manufacturer and module
        self.manufacturer = Manufacturer.objects.create(name="Test Manufacturer")
        self.module = Module.objects.create(
            name="Test Module", manufacturer=self.manufacturer
        )

        # Create a type for ModuleBomListItem
        self.type = Types.objects.create(name="Test Type")

        # Create components with the required type
        self.component1 = Component.objects.create(
            description="Component 1", type=self.type
        )
        self.component2 = Component.objects.create(
            description="Component 2", type=self.type
        )

        # Create a BOM list item and associate it with the module and type
        self.bom_list_item = ModuleBomListItem.objects.create(
            description="Test BOM Item",
            module=self.module,
            type=self.type,
        )
        self.bom_list_item.components_options.add(self.component1, self.component2)

        # Add inventory for the user
        self.inventory_item1 = UserInventory.objects.create(
            user=self.user, component=self.component1, quantity=5
        )
        self.inventory_item2 = UserInventory.objects.create(
            user=self.user, component=self.component2, quantity=10
        )

    def test_inventory_quantity_sum(self):
        """
        Test that the endpoint returns the correct sum of inventory quantities.
        """
        url = reverse(
            "user-inventory-quantities-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": self.bom_list_item.pk},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 15)  # 5 + 10

    def test_inventory_quantity_sum_no_items(self):
        """
        Test that the endpoint returns 0 when there are no matching inventory items.
        """
        new_bom_list_item = ModuleBomListItem.objects.create(
            description="New BOM Item", module=self.module, type=self.type
        )
        url = reverse(
            "user-inventory-quantities-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": new_bom_list_item.pk},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 0)

    def test_invalid_bom_list_item(self):
        """
        Test that the endpoint returns 404 for an invalid BOM list item ID.
        """
        url = reverse(
            "user-inventory-quantities-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": uuid4()},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_access(self):
        """
        Test that the endpoint returns 401 for unauthenticated users.
        """
        self.client.logout()
        url = reverse(
            "user-inventory-quantities-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": self.bom_list_item.pk},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, 403)

    def test_inventory_quantity_sum_with_items(self):
        # Create components and add them to the user's inventory
        component1 = Component.objects.create(description="Component 1", type=self.type)
        component2 = Component.objects.create(description="Component 2", type=self.type)

        UserInventory.objects.create(component=component1, user=self.user, quantity=5)
        UserInventory.objects.create(component=component2, user=self.user, quantity=10)

        # Assign the components to the BOM list item
        self.bom_list_item.components_options.set(
            [component1, component2]
        )  # Use set() for clarity

        # Verify the BOM list item setup
        self.assertQuerysetEqual(
            self.bom_list_item.components_options.all(),
            [component1.pk, component2.pk],
            transform=lambda x: x.pk,
        )

        url = reverse(
            "user-inventory-quantities-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": self.bom_list_item.pk},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 15)  # Sum of 5 + 10

    def test_inventory_quantity_sum_ignores_non_inventory_components(self):
        # Create components
        component1 = Component.objects.create(description="Component 1", type=self.type)
        component2 = Component.objects.create(description="Component 2", type=self.type)
        component3 = Component.objects.create(description="Component 3", type=self.type)

        # Add only component1 and component2 to the user's inventory
        UserInventory.objects.create(component=component1, user=self.user, quantity=3)
        UserInventory.objects.create(component=component2, user=self.user, quantity=7)

        # Assign all components to the BOM list item
        self.bom_list_item.components_options.set([component1, component2, component3])

        # Verify the BOM list item setup
        self.assertQuerysetEqual(
            self.bom_list_item.components_options.all(),
            [component1.pk, component2.pk, component3.pk],
            transform=lambda x: x.pk,
        )

        url = reverse(
            "user-inventory-quantities-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": self.bom_list_item.pk},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["quantity"], 10
        )  # Only sums quantities for component1 and component2


class GetUserInventoryQuantityTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a user and authenticate
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.login(username="testuser", password="password")

        # Create required manufacturers and types
        self.component_manufacturer = ComponentManufacturer.objects.create(
            name="Component Manufacturer"
        )
        self.component_type = Types.objects.create(name="Resistor")

        # Create components
        self.component1 = Component.objects.create(
            description="Component 1",
            manufacturer=self.component_manufacturer,
            type=self.component_type,
        )
        self.component2 = Component.objects.create(
            description="Component 2",
            manufacturer=self.component_manufacturer,
            type=self.component_type,
        )

    def test_total_quantity_for_existing_component(self):
        """
        Test that the endpoint returns the correct total quantity for an existing component.
        """
        # Add inventory items for the component
        UserInventory.objects.create(
            user=self.user, component=self.component1, quantity=5
        )
        UserInventory.objects.create(
            user=self.user, component=self.component1, quantity=10
        )

        url = reverse(
            "user-inventory-quantity", kwargs={"component_pk": self.component1.pk}
        )
        response = self.client.get(url)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 15)  # 5 + 10

    def test_total_quantity_zero_for_nonexistent_component(self):
        """
        Test that the endpoint returns 0 for a component with no inventory items.
        """
        url = reverse(
            "user-inventory-quantity", kwargs={"component_pk": self.component2.pk}
        )
        response = self.client.get(url)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 0)  # No items for component2

    def test_unauthenticated_access(self):
        """
        Test that the endpoint returns 403 for unauthenticated users.
        """
        self.client.logout()  # Ensure unauthenticated access
        url = reverse(
            "user-inventory-quantity", kwargs={"component_pk": self.component1.pk}
        )
        response = self.client.get(url)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_total_quantity_handles_large_numbers(self):
        """
        Test that the endpoint correctly calculates total quantity for large numbers.
        """
        UserInventory.objects.create(
            user=self.user, component=self.component1, quantity=100000
        )
        UserInventory.objects.create(
            user=self.user, component=self.component1, quantity=200000
        )

        url = reverse(
            "user-inventory-quantity", kwargs={"component_pk": self.component1.pk}
        )
        response = self.client.get(url)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 300000)  # 100000 + 200000

    def test_total_quantity_ignores_other_users(self):
        """
        Test that the endpoint does not include inventory items from other users.
        """
        # Create another user and their inventory item
        other_user = User.objects.create_user(username="otheruser", password="password")
        UserInventory.objects.create(
            user=other_user, component=self.component1, quantity=50
        )

        # Add inventory items for the authenticated user
        UserInventory.objects.create(
            user=self.user, component=self.component1, quantity=5
        )

        url = reverse(
            "user-inventory-quantity", kwargs={"component_pk": self.component1.pk}
        )
        response = self.client.get(url)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 5)  # Only user's items

    def test_invalid_component_id(self):
        """
        Test that the endpoint returns 0 for an invalid component ID.
        """
        invalid_component_id = "99999999-9999-9999-9999-999999999999"
        url = reverse(
            "user-inventory-quantity", kwargs={"component_pk": invalid_component_id}
        )
        response = self.client.get(url)

        # Verify response
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["quantity"], 0)  # No items for invalid component


# Url: /api/inventory/<uuid:component_pk>/locations/
# Frontend: useGetInventoryLocations.ts
class GetComponentLocationsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a user and authenticate
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.login(username="testuser", password="password")

        # Create component type and component
        self.component_type = Types.objects.create(name="Resistor")
        self.component = Component.objects.create(
            description="Component 1", type=self.component_type
        )

        # Add inventory locations for the component
        UserInventory.objects.create(
            component=self.component, user=self.user, location="Bin A", quantity=10
        )
        UserInventory.objects.create(
            component=self.component, user=self.user, location="Bin B", quantity=20
        )

    def test_get_component_locations(self):
        """
        Test that the endpoint returns all unique locations and quantities for the component.
        """
        url = reverse(
            "user_inventory_locations", kwargs={"component_pk": self.component.pk}
        )
        response = self.client.get(url)

        expected_data = [
            {"location": "Bin A", "quantity": 10},
            {"location": "Bin B", "quantity": 20},
        ]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), expected_data)

    def test_get_component_locations_no_entries(self):
        """
        Test that the endpoint returns an empty list if there are no locations for the component.
        """
        new_component = Component.objects.create(
            description="Component 2", type=self.component_type
        )
        url = reverse(
            "user_inventory_locations", kwargs={"component_pk": new_component.pk}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_invalid_component(self):
        """
        Test that the endpoint handles invalid component IDs gracefully.
        """
        # Use a valid but non-existent UUID
        invalid_uuid = "6331d1e8-3b5e-4d4f-b273-a2852aef12f2"
        url = reverse("user_inventory_locations", kwargs={"component_pk": invalid_uuid})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    def test_unauthenticated_access(self):
        """
        Test that the endpoint returns 401 Unauthorized for unauthenticated users.
        """
        self.client.logout()
        url = reverse(
            "user_inventory_locations", kwargs={"component_pk": self.component.pk}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_aggregation_same_location(self):
        """
        Test that the endpoint aggregates quantities for the same location by updating the quantity.
        """
        # Update the quantity for an existing location
        existing_inventory = UserInventory.objects.get(location="Bin A")
        existing_inventory.quantity += 5  # Add 5 to the existing quantity
        existing_inventory.save()

        url = reverse(
            "user_inventory_locations", kwargs={"component_pk": self.component.pk}
        )
        response = self.client.get(url)

        expected_data = [
            {"location": "Bin A", "quantity": 15},  # Updated from 10 to 15
            {"location": "Bin B", "quantity": 20},
        ]

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), expected_data)

    def test_component_no_inventory_entries(self):
        """
        Test that the endpoint returns an empty list for components without inventory entries.
        """
        component_no_inventory = Component.objects.create(
            description="Component No Inventory", type=self.component_type
        )

        url = reverse(
            "user_inventory_locations",
            kwargs={"component_pk": component_no_inventory.pk},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])

    # TODO
    # def test_case_sensitive_locations(self):
    #     """
    #     Test that the endpoint treats locations with different cases as distinct.
    #     """
    #     # Add a similar location with a different case
    #     UserInventory.objects.create(
    #         component=self.component, user=self.user, location="bin a", quantity=5
    #     )

    #     url = reverse(
    #         "user_inventory_locations", kwargs={"component_pk": self.component.pk}
    #     )
    #     response = self.client.get(url)

    #     expected_data = [
    #         {"location": "Bin A", "quantity": 10},
    #         {"location": "bin a", "quantity": 5},
    #         {"location": "Bin B", "quantity": 20},
    #     ]

    #     self.assertEqual(response.status_code, status.HTTP_200_OK)
    #     self.assertEqual(response.json(), expected_data)


# Url: /api/inventory/locations/
# Frontend: useGetInventoryLocationsMultiple
class GetComponentsLocationsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # Create a user and authenticate
        self.user = User.objects.create_user(username="testuser", password="password")
        self.client.login(username="testuser", password="password")

        # Create another user for isolation testing
        self.other_user = User.objects.create_user(
            username="otheruser", password="password"
        )

        # Create a component type and components
        self.component_type = Types.objects.create(name="Resistor")
        self.component1 = Component.objects.create(
            description="Component 1", type=self.component_type
        )
        self.component2 = Component.objects.create(
            description="Component 2", type=self.component_type
        )

        # Add inventory locations for the components with JSON data
        UserInventory.objects.create(
            component=self.component1,
            user=self.user,
            location={"bin": "A", "section": 1},
            quantity=10,
        )
        UserInventory.objects.create(
            component=self.component1,
            user=self.user,
            location={"bin": "B", "section": 2},
            quantity=20,
        )
        UserInventory.objects.create(
            component=self.component2,
            user=self.user,
            location={"bin": "C", "section": 3},
            quantity=15,
        )

    def test_get_components_locations_valid_components(self):
        """
        Test that the endpoint returns correct locations and quantities for multiple components.
        """
        url = reverse("user_inventory_locations_multiple")
        response = self.client.get(
            url, {"component_pks": [self.component1.pk, self.component2.pk]}
        )

        expected_data = {
            str(self.component1.pk): [
                {
                    "component": {
                        "id": str(self.component1.pk),
                        "location": {"bin": "A", "section": 1},
                        "quantity": 10,
                    }
                },
                {
                    "component": {
                        "id": str(self.component1.pk),
                        "location": {"bin": "B", "section": 2},
                        "quantity": 20,
                    }
                },
            ],
            str(self.component2.pk): [
                {
                    "component": {
                        "id": str(self.component2.pk),
                        "location": {"bin": "C", "section": 3},
                        "quantity": 15,
                    }
                },
            ],
        }

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.json(), expected_data)

    def test_get_components_locations_no_inventory_for_component(self):
        """
        Test that the endpoint returns an empty list for components with no inventory.
        """
        component3 = Component.objects.create(
            description="Component 3", type=self.component_type
        )

        url = reverse("user_inventory_locations_multiple")
        response = self.client.get(url, {"component_pks": [component3.pk]})

        expected_data = {
            str(component3.pk): [],
        }

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.json(), expected_data)

    def test_get_components_locations_complex_json(self):
        """
        Test that the endpoint handles complex JSON structures in locations.
        """
        UserInventory.objects.create(
            component=self.component1,
            user=self.user,
            location={"bin": "D", "subsection": {"rack": 3, "level": 2}},
            quantity=5,
        )

        url = reverse("user_inventory_locations_multiple")
        response = self.client.get(url, {"component_pks": [self.component1.pk]})

        expected_data = {
            str(self.component1.pk): [
                {
                    "component": {
                        "id": str(self.component1.pk),
                        "location": {"bin": "A", "section": 1},
                        "quantity": 10,
                    }
                },
                {
                    "component": {
                        "id": str(self.component1.pk),
                        "location": {"bin": "B", "section": 2},
                        "quantity": 20,
                    }
                },
                {
                    "component": {
                        "id": str(self.component1.pk),
                        "location": {
                            "bin": "D",
                            "subsection": {"rack": 3, "level": 2},
                        },
                        "quantity": 5,
                    }
                },
            ]
        }

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.json(), expected_data)

    def test_cross_user_data_isolation(self):
        """
        Test that the endpoint only returns data for the authenticated user.
        """
        # Add inventory for the other user
        UserInventory.objects.create(
            component=self.component1,
            user=self.other_user,
            location={"bin": "D", "section": 4},
            quantity=30,
        )

        url = reverse("user_inventory_locations_multiple")
        response = self.client.get(url, {"component_pks": [self.component1.pk]})

        # Expected data should only include locations for self.user
        expected_data = {
            str(self.component1.pk): [
                {
                    "component": {
                        "id": str(self.component1.pk),
                        "location": {"bin": "A", "section": 1},
                        "quantity": 10,
                    }
                },
                {
                    "component": {
                        "id": str(self.component1.pk),
                        "location": {"bin": "B", "section": 2},
                        "quantity": 20,
                    }
                },
            ]
        }

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertDictEqual(response.json(), expected_data)


class UserInventoryViewTest(APITestCase):
    def setUp(self):
        # Create a test user
        self.user = User.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        # Create a test component type and manufacturer
        self.component_type = Types.objects.create(name="Resistor")
        self.manufacturer = ComponentManufacturer.objects.create(
            name="Test Manufacturer"
        )

        # Create a test component
        self.component = Component.objects.create(
            description="Test Resistor",
            type=self.component_type,
            manufacturer=self.manufacturer,
            manufacturer_part_no="TR-001",
            mounting_style="th",
        )

    def test_get_user_inventory(self):
        # Create sample inventory for the user
        UserInventory.objects.create(
            user=self.user, component=self.component, quantity=10
        )

        response = self.client.get("/api/inventory/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["quantity"], 10)

    def test_post_user_inventory_create(self):
        data = {
            "quantity": 5,
            "location": ["Shelf 1", "Bin A"],
        }
        response = self.client.post(
            f"/api/inventory/{self.component.id}/create-or-update/", data
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["quantity"], 5)
        self.assertEqual(response.data["location"], ["Shelf 1", "Bin A"])

    def test_post_user_inventory_update(self):
        # Create an initial inventory item
        inventory = UserInventory.objects.create(
            user=self.user, component=self.component, quantity=5, location=["Shelf 1"]
        )

        data = {
            "quantity": 10,
            "editMode": True,
            "location": ["Shelf 1"],
        }
        response = self.client.post(
            f"/api/inventory/{self.component.id}/create-or-update/", data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inventory.refresh_from_db()
        self.assertEqual(inventory.quantity, 10)

    def test_delete_user_inventory(self):
        # Create an inventory item to delete
        inventory = UserInventory.objects.create(
            user=self.user, component=self.component, quantity=5
        )

        response = self.client.delete(f"/api/inventory/{inventory.id}/delete/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(UserInventory.objects.filter(id=inventory.id).exists())

    def test_patch_user_inventory_location_update(self):
        # Create an inventory item
        inventory = UserInventory.objects.create(
            user=self.user, component=self.component, quantity=5, location=["Shelf 1"]
        )

        data = {
            "location": ["Shelf 2"],
        }
        response = self.client.patch(f"/api/inventory/{inventory.id}/update/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        inventory.refresh_from_db()
        self.assertEqual(inventory.location, ["Shelf 2"])

    def test_patch_user_inventory_duplicate_location(self):
        # Create two inventory items with the same user and component
        inventory1 = UserInventory.objects.create(
            user=self.user, component=self.component, quantity=5, location=["Shelf 1"]
        )
        UserInventory.objects.create(
            user=self.user, component=self.component, quantity=10, location=["Shelf 2"]
        )

        data = {
            "location": ["Shelf 2"],
        }
        response = self.client.patch(f"/api/inventory/{inventory1.id}/update/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(
            response.data["error"],
            "A user inventory item with this location already exists.",
        )

    def test_post_user_inventory_invalid_component(self):
        invalid_uuid = uuid.uuid4()
        data = {
            "quantity": 5,
            "location": ["Shelf 1", "Bin A"],
        }
        response = self.client.post(
            f"/api/inventory/{invalid_uuid}/create-or-update/", data
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_delete_nonexistent_inventory(self):
        non_existent_uuid = uuid.uuid4()
        response = self.client.delete(f"/inventory/{non_existent_uuid}/delete/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["detail"], "User inventory not found")
