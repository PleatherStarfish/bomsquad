from uuid import UUID
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
        print("quantity", quantity)

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

            print(existing_inventory_items)

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


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_inventory_quantity(request, component_pk):
    total_quantity = UserInventory.objects.filter(
        component__id=component_pk, user=request.user
    ).aggregate(total=Sum("quantity"))["total"]

    # total_quantity will be None if there are no items, so default to 0
    total_quantity = total_quantity if total_quantity is not None else 0

    return Response({"quantity": total_quantity}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_inventory_quantities_for_bom_list_item(request, modulebomlistitem_pk):
    """
    Get sum of components in user inventory that fulfill a given bom list item
    """
    bom_list_item = ModuleBomListItem.objects.get(id=modulebomlistitem_pk)
    inventory = UserInventory.objects.filter(
        component__in=bom_list_item.components_options.all(), user=request.user
    )

    # Use aggregate function to get the sum of 'quantity' attribute
    quantity_sum = inventory.aggregate(total=Sum("quantity"))["total"]

    # quantity_sum will be None if there are no items, so default to 0
    quantity_sum = quantity_sum if quantity_sum is not None else 0

    return Response({"quantity": quantity_sum}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
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

    if not locations_and_quantities:
        # Return an empty JSON object
        return Response({}, status=status.HTTP_200_OK)

    # Prepare the response data
    locations_with_quantity = [
        {"location": item["location"], "quantity": item["quantity"]}
        for item in locations_and_quantities
    ]

    return Response(locations_with_quantity, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
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
