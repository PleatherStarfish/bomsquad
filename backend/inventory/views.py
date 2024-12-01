from uuid import UUID
import uuid
from components.models import Component
from django.db.models import Sum, Func
from django.db import models
from inventory.models import UserInventory
from inventory.serializers import UserInventorySerializer
from modules.models import ModuleBomListItem
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
import json
from django.db.models import Q
from django.http import JsonResponse


class UserInventoryView(APIView):
    """
    Handles GET, POST, DELETE, and PATCH methods for the user's inventory.
    """

    # permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        inventory = UserInventory.objects.filter(user=user)
        serializer = UserInventorySerializer(inventory, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, component_pk):
        user = request.user

        # Determine the editing mode from request
        edit_mode = request.data.get("editMode", True)
        location = request.data.get("location", "")

        # Handle location if it is a list
        if isinstance(location, list):
            location = ", ".join(location).strip()

        location_list = location.split(",") if location else None

        # Filter the user inventory items by user, component_id, and location
        if location_list is not None:
            # Using __exact lookup for an exact match of the JSON array
            user_inventory_items = UserInventory.objects.filter(
                user=user, component__id=component_pk, location__exact=location_list
            )
        else:
            user_inventory_items = UserInventory.objects.filter(
                user=user, component__id=component_pk, location__isnull=True
            )

        # If the user inventory item exists, update the quantity
        if user_inventory_items.exists():
            user_inventory_item = user_inventory_items.first()
            quantity = int(request.data.get("quantity", 0))
            if edit_mode:
                user_inventory_item.quantity = quantity
            else:
                user_inventory_item.quantity += quantity

            user_inventory_item.save()
            serializer = UserInventorySerializer(user_inventory_item)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # If the user inventory item does not exist, create a new one
        quantity = int(request.data.get("quantity", 0))

        component = Component.objects.get(id=component_pk)

        user_inventory = UserInventory.objects.create(
            user=user, component=component, quantity=quantity, location=location_list
        )

        serializer = UserInventorySerializer(user_inventory)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, inventory_pk):
        # Retrieve the user inventory item using the primary key
        user_inventory_item = UserInventory.objects.filter(pk=inventory_pk).first()

        if not user_inventory_item:
            return Response(
                {"detail": "User inventory not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user_inventory_item.delete()
        return Response(
            {"detail": "User inventory deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )

    def patch(self, request, inventory_pk):
        user = request.user

        # Process the location data from the request
        location = request.data.get("location", "")

        # Handle location if it is a list
        if isinstance(location, list):
            location = ", ".join(location).strip()

        location_list = location.split(",") if location else None

        # Retrieve the user inventory item by inventory_pk
        user_inventory_item = UserInventory.objects.filter(pk=inventory_pk).first()

        # Check if the location already exists for this user and component
        if location_list is not None:

            existing_inventory_items = UserInventory.objects.filter(
                user=user,
                component=user_inventory_item.component,
                location__exact=location_list,
            ).exclude(pk=inventory_pk)

            if existing_inventory_items.exists():
                return Response(
                    {
                        "error": "A user inventory item with this location already exists."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update the location if it doesn't already exist
            user_inventory_item.location = location_list
            user_inventory_item.save(update_fields=["location"])

        # Serialize and save the rest of the data
        serializer = UserInventorySerializer(
            user_inventory_item, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Tests
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_inventory_quantity(request, component_pk):
    total_quantity = UserInventory.objects.filter(
        component__id=component_pk, user=request.user
    ).aggregate(total=Sum("quantity"))["total"]

    # total_quantity will be None if there are no items, so default to 0
    total_quantity = total_quantity if total_quantity is not None else 0

    return Response({"quantity": total_quantity}, status=status.HTTP_200_OK)


# Tests
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_inventory_quantities_for_bom_list_item(request, modulebomlistitem_pk):
    """
    Get sum of components in user inventory that fulfill a given BOM list item
    """
    try:
        bom_list_item = ModuleBomListItem.objects.get(id=modulebomlistitem_pk)

        # Fetch IDs of components associated with the BOM list item
        components_in_bom = bom_list_item.components_options.values_list(
            "id", flat=True
        )

        # Filter inventory to include only components matching the BOM list item and belonging to the user
        inventory = UserInventory.objects.filter(
            component_id__in=components_in_bom, user=request.user
        ).distinct()  # Ensure no duplicates

        # Aggregate the sum of 'quantity' for the filtered inventory
        quantity_sum = inventory.aggregate(total=Sum("quantity"))["total"] or 0

        return Response({"quantity": quantity_sum}, status=status.HTTP_200_OK)
    except ModuleBomListItem.DoesNotExist:
        return Response(
            {"error": "Module BOM List Item not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


# Test
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_component_locations(request, component_pk):
    """
    Get all unique locations for a particular component in the user's inventory,
    along with the quantity of the component in each location.
    """
    # Fetch unique locations and corresponding quantity using Django ORM
    locations_and_quantities = (
        UserInventory.objects.filter(component__id=component_pk, user=request.user)
        .values("location", "quantity")
        .distinct()
    )

    if not locations_and_quantities.exists():
        # Return an empty JSON object
        return Response([], status=status.HTTP_200_OK)

    # Prepare the response data
    locations_with_quantity = [
        {"location": item["location"], "quantity": item["quantity"]}
        for item in locations_and_quantities
    ]

    return Response(locations_with_quantity, status=status.HTTP_200_OK)


# Tests
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_components_locations(request):
    """
    Get all unique locations for multiple components in the user's inventory,
    along with the quantity of each component in each location.
    """
    component_pks = request.GET.getlist("component_pks")

    if not component_pks:
        # Return an empty JSON object if no component_pks provided
        return Response([], status=status.HTTP_200_OK)

    components_locations = {}

    for component_pk in component_pks:
        try:
            # Validate UUID
            uuid.UUID(component_pk)
        except ValueError:
            # Skip invalid UUIDs
            components_locations[component_pk] = []
            continue

        # Fetch unique locations and corresponding quantity for each component using Django ORM
        locations_and_quantities = (
            UserInventory.objects.filter(component__id=component_pk, user=request.user)
            .values(
                "location",
                "quantity",
            )
            .distinct()
        )

        # Prepare the response data for each component
        locations_with_quantity = [
            {
                "component": {
                    "id": component_pk,
                    "location": item["location"],
                    "quantity": item["quantity"],
                }
            }
            for item in locations_and_quantities
        ]

        components_locations[component_pk] = locations_with_quantity

    return Response(components_locations, status=status.HTTP_200_OK)


class UserInventoryTreeView(APIView):
    def get(self, request):
        user = request.user
        inventory_items = UserInventory.objects.filter(user=user)

        # Create a nested tree structure
        inventory_tree = {}

        for item in inventory_items:
            location_path = item.location if item.location else []
            current_level = inventory_tree

            for loc in location_path:
                if loc not in current_level:
                    current_level[loc] = {}
                current_level = current_level[loc]

            current_level["component"] = str(item.component.description)
            current_level["quantity"] = item.quantity

        return JsonResponse({"inventory_tree": inventory_tree}, safe=False)
