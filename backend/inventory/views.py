from uuid import UUID
from components.models import Component
from django.db.models import Sum
from inventory.models import UserInventory
from inventory.serializers import UserInventorySerializer
from modules.models import ModuleBomListItem
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404


class UserInventoryView(APIView):
    """
    Handles GET, POST, DELETE, and PATCH methods for the user's inventory.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        inventory = UserInventory.objects.filter(user=user)
        serializer = UserInventorySerializer(inventory, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, component_pk):
        user = request.user

        # Determine the editing mode from request
        edit_mode = request.data.get("editMode", True)

        # Filter the user inventory items by user and component_id
        user_inventory_items = UserInventory.objects.filter(
            user=user, component__id=component_pk
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
            user=user, component=component, quantity=quantity
        )

        serializer = UserInventorySerializer(user_inventory)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, component_pk):
        user = request.user
        user_inventory_item = UserInventory.objects.filter(
            user=user, component__id=component_pk
        ).first()

        if not user_inventory_item:
            return Response(
                {"detail": "User inventory not found"}, status=status.HTTP_404_NOT_FOUND
            )

        user_inventory_item.delete()
        return Response(
            {"detail": "User inventory deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )

    def patch(self, request, component_pk):
        user = request.user
        user_inventory_item = UserInventory.objects.filter(
            user=user, component__id=component_pk
        ).first()

        if not user_inventory_item:
            return Response(
                {"detail": "User inventory not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = UserInventorySerializer(
            user_inventory_item, data=request.data, partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_inventory_quantity(request, component_pk):
    inventory = UserInventory.objects.filter(
        component__id=component_pk, user=request.user
    )

    # Check if inventory exists
    if inventory.exists():
        # Access the first inventory object in the QuerySet
        # and retrieve the 'quantity' attribute
        quantity = inventory.first().quantity
        return Response({"quantity": quantity}, status=status.HTTP_200_OK)
    else:
        return Response({"quantity": 0}, status=status.HTTP_200_OK)


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

    # Check if inventory exists
    if inventory.exists():
        # Use aggregate function to get the sum of 'quantity' attribute
        quantity_sum = inventory.aggregate(Sum("quantity")).get("quantity__sum")
        return Response({"quantity": quantity_sum}, status=status.HTTP_200_OK)
    else:
        return Response({"quantity": 0}, status=status.HTTP_200_OK)
