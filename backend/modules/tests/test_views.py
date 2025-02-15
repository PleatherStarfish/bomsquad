from decimal import Decimal
from uuid import uuid4
from modules.models import (
    Module,
    Manufacturer,
    ModuleBomListItem,
    SuggestedComponentForBomListItem,
)
from components.models import (
    Component,
    ComponentManufacturer,
    ComponentSupplier,
    ComponentSupplierItem,
    Types,
)
from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import CustomUser
from django.urls import reverse


class SuggestedComponentForBomListItemTests(APITestCase):
    def setUp(self):
        # Create a test user and log in
        self.user = CustomUser.objects.create_user(
            username="testuser",
            password="testpassword",
            email="testuser@example.com",
        )
        self.client.force_login(self.user)

        # Create a module manufacturer
        self.module_manufacturer = Manufacturer.objects.create(
            id=uuid4(), name="Module Manufacturer"
        )

        # Create a component manufacturer
        self.component_manufacturer = ComponentManufacturer.objects.create(
            id=uuid4(), name="Component Manufacturer"
        )

        # Create a module
        self.module = Module.objects.create(
            id=uuid4(),
            name="Test Module",
            manufacturer=self.module_manufacturer,
            description="A test module",
        )

        # Create a component type
        self.resistor_type = Types.objects.create(name="Resistor")

        self.manufacturer = Manufacturer.objects.create(
            id=uuid4(), name="Test Module Manufacturer"
        )

        # Create a ModuleBomListItem linked to the module
        self.module_bom_list_item = ModuleBomListItem.objects.create(
            id=uuid4(),
            description="Test BOM List Item",
            module=self.module,
            type=self.resistor_type,
            quantity=1,
        )

        # Create a component
        self.component = Component.objects.create(
            id=uuid4(),
            description="Test Component",
            type=self.resistor_type,
            manufacturer=self.component_manufacturer,  # Assign correct manufacturer instance
            manufacturer_part_no="TEST123",
            mounting_style="th",
        )

        # Create a supplier for testing
        self.supplier = ComponentSupplier.objects.create(
            id=uuid4(), name="Test Supplier"
        )

    def get_url(self, module_bom_list_item_id):
        return reverse(
            "suggest-component-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": module_bom_list_item_id},
        )

    def test_suggest_existing_component(self):
        # Prepare data and URL
        url = self.get_url(self.module_bom_list_item.id)
        data = {"component_id": str(self.component.id)}

        # Send POST request
        response = self.client.post(url, data, format="json")

        # Assertions
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)
        self.assertEqual(
            response.data["module_bom_list_item"], str(self.module_bom_list_item.id)
        )
        self.assertEqual(response.data["suggested_component"], str(self.component.id))

    def test_suggest_with_only_component_id(self):
        # Prepare data and URL
        url = self.get_url(self.module_bom_list_item.id)
        data = {"component_id": str(self.component.id)}

        # Send POST request
        response = self.client.post(url, data, format="json")

        # Assertions
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)
        self.assertEqual(
            response.data["module_bom_list_item"], str(self.module_bom_list_item.id)
        )
        self.assertEqual(response.data["suggested_component"], str(self.component.id))

        # Validate that no new component was created
        self.assertEqual(Component.objects.filter(id=self.component.id).count(), 1)

        # Validate that a suggestion was created
        suggestion = SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=self.component,
            suggested_by=self.user,
        ).first()
        self.assertIsNotNone(suggestion)
        self.assertEqual(suggestion.status, "pending")

    def test_prevent_duplicate_suggested_component_id_for_bom_list_item(self):
        # Create an initial suggestion
        SuggestedComponentForBomListItem.objects.create(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=self.component,
            suggested_by=self.user,
            status="pending",
        )

        # Prepare data and URL for the duplicate suggestion
        url = self.get_url(self.module_bom_list_item.id)
        data = {"component_id": str(self.component.id)}

        # Send POST request
        response = self.client.post(url, data, format="json")

        # Assertions
        self.assertEqual(response.status_code, 400)  # Expecting a validation error
        self.assertIn(
            "component_id", response.data
        )  # Check the error is under 'component_id'
        self.assertIn(
            "This component has already been suggested for the specified BOM list item.",
            response.data["component_id"],
        )

        # Validate that no new suggestion was created
        suggestions = SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=self.component,
        )
        self.assertEqual(suggestions.count(), 1)  # Only the original suggestion exists

    def test_prevent_component_already_associated_with_bom_list_item(self):
        # Associate the component directly with the ModuleBomListItem
        self.module_bom_list_item.components_options.add(self.component)

        # Prepare data and URL for the suggestion
        url = self.get_url(self.module_bom_list_item.id)
        data = {"component_id": str(self.component.id)}

        # Send POST request
        response = self.client.post(url, data, format="json")

        # Assertions
        self.assertEqual(response.status_code, 400)  # Expecting a validation error
        self.assertIn(
            "component_id", response.data
        )  # Check the error is under 'component_id'
        self.assertIn(
            "This component is already associated with the BOM list item.",
            response.data["component_id"],
        )

        # Validate that no new suggestion was created
        suggestions = SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=self.component,
        )
        self.assertEqual(suggestions.count(), 0)  # No suggestion should exist

    def test_prevent_both_component_id_and_component_data_submission(self):
        # Prepare data with both component_id and component_data
        url = self.get_url(self.module_bom_list_item.id)
        component_data = {
            "component": {
                "farads": 100,
                "manufacturer": str(self.manufacturer.id),
                "manufacturer_part_no": "TEST123",
                "mounting_style": "th",
                "tolerance": "5%",
                "type": str(self.resistor_type.id),
                "voltage_rating": "50V",
                "wattage": "0.25W",
            },
            "supplier_items": [
                {
                    "currency": "USD",
                    "link": "https://example.com",
                    "price": 1.23,
                    "supplier": str(self.manufacturer.id),
                    "supplier_item_no": "SUP123",
                }
            ],
        }
        data = {
            "component_id": str(self.component.id),
            "component_data": component_data,
        }

        # Send POST request
        response = self.client.post(url, data, format="json")

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertIn("non_field_errors", response.data)
        self.assertEqual(
            response.data["non_field_errors"][0],
            "You cannot provide both 'component_id' and 'component_data'.",
        )

    def test_successful_submission_with_diode_component_data(self):
        """
        Test successful submission with component data for a diode,
        leaving off fields like tolerance, voltage_rating, wattage, and farads.
        """
        # Create a component type for Diode
        diode_type = Types.objects.create(name="Diode")

        # Prepare data with only component_data
        url = self.get_url(self.module_bom_list_item.id)
        data = {
            "component_data": {
                "component": {
                    "manufacturer": str(self.component_manufacturer.id),
                    "type": str(diode_type.id),
                    "manufacturer_part_no": "DIODE123",
                    "mounting_style": "th",
                },
                "supplier_items": [
                    {
                        "supplier": str(self.supplier.id),
                        "supplier_item_no": "SUP456",
                        "price": 0.99,
                        "currency": "USD",
                        "link": "https://example.com/diode",
                    }
                ],
            }
        }

        response = self.client.post(url, data, format="json")

        # Assertions for success
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)
        self.assertEqual(
            response.data["module_bom_list_item"], str(self.module_bom_list_item.id)
        )

        # Validate that the new component was created
        new_component = Component.objects.filter(
            manufacturer=self.component_manufacturer,
            manufacturer_part_no="DIODE123",
            type=diode_type,
        ).first()
        self.assertIsNotNone(new_component)
        self.assertEqual(new_component.type.name, "Diode")
        self.assertEqual(new_component.manufacturer.name, "Component Manufacturer")
        self.assertEqual(new_component.manufacturer_part_no, "DIODE123")
        self.assertEqual(new_component.mounting_style, "th")

        # Validate that the supplier item was created
        supplier_item = new_component.supplier_items.filter(
            supplier_item_no="SUP456"
        ).first()
        self.assertIsNotNone(supplier_item)
        self.assertEqual(supplier_item.price.amount, Decimal("0.99"))
        self.assertEqual(supplier_item.link, "https://example.com/diode")

        # Validate that the suggested component entry was created
        suggested_component = SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=new_component,
        ).first()
        self.assertIsNotNone(suggested_component)
        self.assertEqual(suggested_component.suggested_by, self.user)

    def test_successful_submission_with_component_data(self):
        # Prepare data with only component_data
        url = self.get_url(self.module_bom_list_item.id)
        data = {
            "component_data": {
                "component": {
                    "manufacturer": str(self.component_manufacturer.id),
                    "type": str(self.resistor_type.id),
                    "manufacturer_part_no": "TEST1234",
                    "mounting_style": "th",
                    "tolerance": "5%",
                    "voltage_rating": "50V",
                    "wattage": "0.25W",
                    "farads": 100,
                },
                "supplier_items": [
                    {
                        "supplier": str(self.supplier.id),
                        "supplier_item_no": "SUP123",
                        "price": 1.23,
                        "currency": "USD",
                        "link": "https://example.com",
                    }
                ],
            }
        }

        response = self.client.post(url, data, format="json")

        # Assertions for success
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)
        self.assertEqual(
            response.data["module_bom_list_item"], str(self.module_bom_list_item.id)
        )

        # Validate that the new component was created
        new_component = Component.objects.filter(
            manufacturer=self.component_manufacturer,
            manufacturer_part_no="TEST1234",
            type=self.resistor_type,
        ).first()
        self.assertIsNotNone(new_component)
        self.assertEqual(new_component.type.name, "Resistor")
        self.assertEqual(new_component.manufacturer.name, "Component Manufacturer")
        self.assertEqual(new_component.manufacturer_part_no, "TEST1234")
        self.assertEqual(new_component.mounting_style, "th")
        self.assertEqual(new_component.wattage, "0.25W")
        self.assertEqual(new_component.tolerance, "5%")

        # Validate that the supplier item was created
        supplier_item = new_component.supplier_items.filter(
            supplier_item_no="SUP123"
        ).first()
        self.assertIsNotNone(supplier_item)
        self.assertEqual(supplier_item.price.amount, Decimal("1.23"))

        # Validate that the suggested component entry was created
        suggested_component = SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=new_component,
        ).first()
        self.assertIsNotNone(suggested_component)
        self.assertEqual(suggested_component.suggested_by, self.user)

    def test_reuse_existing_component_from_component_data(self):
        """
        Test that if `component_data` corresponds to an existing component in the
        database but not associated with the BOM list item, it is treated as if
        the user passed in `component_id`.
        """
        # Clean up database to prevent duplicates
        Component.objects.all().delete()

        # Create an existing component with a specific manufacturer
        existing_component = Component.objects.create(
            manufacturer=self.component_manufacturer,
            type=self.resistor_type,
            description="Existing Component",
            manufacturer_part_no="TEST123",
            mounting_style="th",
            tolerance="5%",
            voltage_rating="50V",
        )

        # Prepare component_data with matching existing component details
        url = self.get_url(self.module_bom_list_item.id)
        component_data = {
            "component": {
                "manufacturer": str(existing_component.manufacturer.id),
                "type": str(existing_component.type.id),
                "manufacturer_part_no": existing_component.manufacturer_part_no,
                "mounting_style": existing_component.mounting_style,
                "tolerance": existing_component.tolerance,
                "voltage_rating": existing_component.voltage_rating,
                "wattage": existing_component.wattage,
                "farads": existing_component.farads,
            },
            "supplier_items": [
                {
                    "supplier": str(self.supplier.id),
                    "supplier_item_no": "SUP456",
                    "price": 2.34,
                    "currency": "USD",
                    "link": "https://example.com/new",
                }
            ],
        }
        data = {"component_data": component_data}

        # Send POST request
        response = self.client.post(url, data, format="json")

        # Assertions for success
        self.assertEqual(response.status_code, 201)
        self.assertIn("id", response.data)
        self.assertEqual(
            response.data["module_bom_list_item"], str(self.module_bom_list_item.id)
        )
        self.assertEqual(
            response.data["suggested_component"], str(existing_component.id)
        )

        # Validate that no new component was created
        component_count = Component.objects.filter(
            manufacturer=self.component_manufacturer,
            manufacturer_part_no="TEST123",
        ).count()
        self.assertEqual(component_count, 1)  # Only the existing component should exist

        # Validate that the suggested component entry was created
        suggestion = SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=existing_component,
            suggested_by=self.user,
        ).first()
        self.assertIsNotNone(suggestion)
        self.assertEqual(suggestion.status, "pending")

    def test_prevent_duplicate_supplier_item_no_for_existing_component(self):
        """
        Test that submitting a supplier item number that already exists in the database
        for the same supplier does not create a new supplier item and raises an error.
        """
        # Create an existing supplier item for the component
        existing_supplier_item = ComponentSupplierItem.objects.create(
            component=self.component,
            supplier=self.supplier,
            supplier_item_no="SUP123",
            price=Decimal("1.23"),
            link="https://example.com",
        )

        # Prepare component_data with the same supplier_item_no and supplier
        url = self.get_url(self.module_bom_list_item.id)
        component_data = {
            "component": {
                "manufacturer": str(self.component.manufacturer.id),
                "type": str(self.component.type.id),
                "manufacturer_part_no": self.component.manufacturer_part_no,
                "mounting_style": self.component.mounting_style,
                "tolerance": self.component.tolerance,
                "voltage_rating": self.component.voltage_rating,
                "wattage": self.component.wattage,
                "farads": self.component.farads,
            },
            "supplier_items": [
                {
                    "supplier": str(self.supplier.id),
                    "supplier_item_no": "SUP123",  # Duplicate supplier item number
                    "price": 2.34,
                    "currency": "USD",
                    "link": "https://example.com/new",
                }
            ],
        }
        data = {"component_data": component_data}

        # Send POST request
        response = self.client.post(url, data, format="json")

        # Assertions: Expecting a validation error
        self.assertEqual(response.status_code, 400)
        self.assertIn("component_data", response.data)
        self.assertIn(
            "A supplier item with number 'SUP123' already exists.",
            response.data["component_data"][0],
        )

        # Validate that no new supplier item was created
        supplier_item_count = ComponentSupplierItem.objects.filter(
            component=self.component, supplier=self.supplier
        ).count()
        self.assertEqual(supplier_item_count, 1)  # No additional supplier items created

        # Validate that no new suggestion was created
        suggestion_count = SuggestedComponentForBomListItem.objects.filter(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=self.component,
        ).count()
        self.assertEqual(suggestion_count, 0)  # No suggestion created


class SuggestedComponentsForBomListItemViewTests(APITestCase):
    def setUp(self):
        # Create test user
        self.user = CustomUser.objects.create_user(
            username="testuser", password="testpassword"
        )
        self.client.force_authenticate(user=self.user)

        # Create a manufacturer for the module
        self.manufacturer = Manufacturer.objects.create(name="Test Manufacturer")

        # Create a module
        self.module = Module.objects.create(
            id=uuid4(),
            name="Test Module",
            manufacturer=self.manufacturer,
            description="A test module",
        )

        # Create a component type and manufacturer
        self.type_resistor = Types.objects.create(name="Resistor")
        self.component_manufacturer = ComponentManufacturer.objects.create(
            name="Test Component Manufacturer"
        )

        # Create a BOM List Item with a module
        self.module_bom_list_item = ModuleBomListItem.objects.create(
            id=uuid4(),
            description="Test BOM Item",
            module=self.module,  # Associate with the module
            type=self.type_resistor,
            quantity=1,
        )

        # Create components and suggestions
        self.component_1 = Component.objects.create(
            description="Component 1",
            manufacturer=self.component_manufacturer,
            type=self.type_resistor,
            manufacturer_part_no="C123",
        )
        self.suggestion_1 = SuggestedComponentForBomListItem.objects.create(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=self.component_1,
            suggested_by=self.user,
        )

        self.component_2 = Component.objects.create(
            description="Component 2",
            manufacturer=self.component_manufacturer,
            type=self.type_resistor,
            manufacturer_part_no="C456",
        )
        self.suggestion_2 = SuggestedComponentForBomListItem.objects.create(
            module_bom_list_item=self.module_bom_list_item,
            suggested_component=self.component_2,
            suggested_by=self.user,
        )

        self.url = reverse(
            "get-suggested-component-for-bom-list-item",
            kwargs={"modulebomlistitem_pk": self.module_bom_list_item.pk},
        )

    def test_get_suggested_components_success(self):
        """
        Test that the GET endpoint returns suggested components for a valid BOM list item.
        """
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        first_item = response.data[0]
        self.assertIn("id", first_item)
        self.assertIn("module_bom_list_item", first_item)
        self.assertIn("suggested_component", first_item)
        self.assertIn("status", first_item)

        # Validate the suggested component structure
        suggested_component = first_item["suggested_component"]
        self.assertIn("id", suggested_component)
        self.assertIn("description", suggested_component)
        self.assertIn("manufacturer_part_no", suggested_component)
        self.assertIn("type", suggested_component)
        self.assertIn("mounting_style", suggested_component)
        self.assertIn("supplier_items", suggested_component)

    def test_get_suggested_components_unauthenticated(self):
        # Logout to simulate unauthenticated access
        self.client.logout()
        url = f"/api/suggested-component/{self.module_bom_list_item.id}/"
        response = self.client.get(url)

        # Assert success response for unauthenticated user
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_suggested_components_404(self):
        invalid_id = uuid4()
        url = f"/api/suggested-component/{invalid_id}/"
        response = self.client.get(url)

        # Assert 404 response
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            response.data["detail"],
            "No suggestions found for the specified BOM list item.",
        )


class ModuleCostStatsTests(APITestCase):
    def setUp(self):
        # Create a module manufacturer.
        self.module_manufacturer = Manufacturer.objects.create(
            id=uuid4(), name="Module Manufacturer"
        )
        # Create a component manufacturer.
        self.component_manufacturer = ComponentManufacturer.objects.create(
            id=uuid4(), name="Component Manufacturer"
        )
        # Create a component type.
        self.resistor_type = Types.objects.create(name="Resistor")

        # Create a module.
        self.module = Module.objects.create(
            id=uuid4(),
            name="Test Module",
            manufacturer=self.module_manufacturer,
            description="A test module",
        )
        # Initialize a counter for unique supplier_item_no values.
        self.supplier_item_counter = 1

    def create_bom_with_component(self, bom_quantity, supplier_prices):
        """
        Helper to create a BOM list item with one component that has one or more supplier items.
          - bom_quantity: Quantity on the BOM item.
          - supplier_prices: List of Decimal unit prices for supplier items.
        Returns the BOM list item.
        """
        # Create a BOM list item with a specific UUID.
        bom = ModuleBomListItem.objects.create(
            id=uuid4(),
            description="Test BOM Item",
            module=self.module,
            type=self.resistor_type,
            quantity=bom_quantity,
        )
        # Create a component.
        component = Component.objects.create(
            id=uuid4(),
            description="Test Component",
            type=self.resistor_type,
            manufacturer=self.component_manufacturer,
            manufacturer_part_no="PART123",
            mounting_style="th",
        )
        # Associate the component with the BOM list item.
        bom.components_options.add(component)
        # For each supplier price, create a supplier and supplier item.
        for price in supplier_prices:
            supplier = ComponentSupplier.objects.create(
                id=uuid4(), name=f"Supplier {self.supplier_item_counter}"
            )
            # Use a counter to generate a unique supplier_item_no.
            supplier_item_no = f"SUP{self.supplier_item_counter}"
            self.supplier_item_counter += 1
            ComponentSupplierItem.objects.create(
                component=component,
                supplier=supplier,
                supplier_item_no=supplier_item_no,
                price=price,  # Assumes price/pcs yields unit_price (with pcs == 1)
                pcs=1,
            )
        return bom

    def get_url(self):
        # The URL is "api/module/cost-stats/<uuid:module_id>/"
        return reverse("module-cost-stats", kwargs={"module_id": self.module.id})

    def test_module_cost_stats_single_bom(self):
        """
        Create one BOM list item with a component that has two supplier items.
        Example:
          - BOM quantity = 2.
          - Supplier prices: 1.00 and 2.00.
        Expected cost options: 2*1.00 = 2.00 and 2*2.00 = 4.00.
          -> low = 2.00, high = 4.00, average = 3.00, median = 3.00.
        """
        self.create_bom_with_component(
            bom_quantity=2, supplier_prices=[Decimal("1.00"), Decimal("2.00")]
        )
        url = self.get_url()
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, 200)

        overall = response.data.get("overall", {})
        self.assertEqual(overall.get("low"), "2.00")
        self.assertEqual(overall.get("high"), "4.00")
        self.assertEqual(overall.get("average"), "3.00")
        self.assertEqual(overall.get("median"), "3.00")

    def test_module_cost_stats_multiple_bom(self):
        """
        Create two BOM list items.
          BOM 1: quantity = 1 with a component having one supplier item at price 10.
            -> cost = 10.
          BOM 2: quantity = 3 with a component having two supplier items with prices 2 and 4.
            -> cost options: 3*2 = 6 and 3*4 = 12; low = 6, high = 12, average = 9, median = 9.
        Overall sums should be:
          low: 10 + 6 = 16, high: 10 + 12 = 22, average: 10 + 9 = 19, median: 10 + 9 = 19.
        """
        # BOM 1
        self.create_bom_with_component(
            bom_quantity=1, supplier_prices=[Decimal("10.00")]
        )
        # BOM 2
        self.create_bom_with_component(
            bom_quantity=3, supplier_prices=[Decimal("2.00"), Decimal("4.00")]
        )
        url = self.get_url()
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, 200)

        overall = response.data.get("overall", {})
        self.assertEqual(overall.get("low"), "16.00")
        self.assertEqual(overall.get("high"), "22.00")
        self.assertEqual(overall.get("average"), "19.00")
        self.assertEqual(overall.get("median"), "19.00")
