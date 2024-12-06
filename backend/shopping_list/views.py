import bleach
import logging
from django.db.models import Min, Max, F, Sum, Case, When, Value
from accounts.models import UserNotes, CustomUser
from components.models import Component, ComponentSupplierItem
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.db.models import F, FloatField, Sum
from django.db.models.functions import Cast
from django.utils import timezone
from inventory.models import UserInventory
from modules.models import Module, ModuleBomListItem
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from shopping_list.models import UserShoppingList, UserShoppingListSaved
from shopping_list.serializers import (
    UserShoppingListSavedSerializer,
    UserShoppingListSerializer,
)
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID
from rest_framework.views import APIView
from django.db import transaction

logger = logging.getLogger(__name__)


class UserShoppingListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the user's own shopping list grouped by module.
        """
        user = request.user
        shopping_list = UserShoppingList.objects.filter(user=user).order_by(
            "module__name"
        )
        serializer = UserShoppingListSerializer(shopping_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, component_pk):
        """
        Endpoint for creating or updating an item in the user's shopping list.
        """
        user = request.user
        quantity = int(request.data.get("quantity", 0))
        module_bom_list_item_pk = UUID(request.data.get("modulebomlistitem_pk", None))
        module_pk = UUID(request.data.get("module_pk", None))

        # Determine the editing mode from request
        edit_mode = request.data.get("editMode", True)

        try:
            component = Component.objects.get(pk=component_pk)
        except Component.DoesNotExist:
            return Response(
                {"detail": "Component not found."}, status=status.HTTP_404_NOT_FOUND
            )

        module_obj = None
        if module_pk:
            try:
                module_obj = Module.objects.get(pk=module_pk)
            except Module.DoesNotExist:
                return Response(
                    {"detail": "Module not found."}, status=status.HTTP_404_NOT_FOUND
                )

        module_bom_list_item = None
        if module_bom_list_item_pk:
            try:
                module_bom_list_item = ModuleBomListItem.objects.get(
                    pk=module_bom_list_item_pk
                )
            except ModuleBomListItem.DoesNotExist:
                return Response(
                    {"detail": "Module BOM list item not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

        user_is_premium = request.user.is_premium
        unique_modules_in_shopping_list = (
            UserShoppingList.objects.filter(user=user)
            .exclude(module__isnull=True)
            .values_list("module", flat=True)
            .distinct()
        )
        # Convert each UUID into a string
        unique_modules_in_shopping_list_str = [
            str(uuid) for uuid in unique_modules_in_shopping_list
        ]

        if (
            not user_is_premium
            and len(unique_modules_in_shopping_list) >= 3
            and not str(module_pk) in unique_modules_in_shopping_list_str
        ):
            return Response(
                {
                    "detail": "You must be a premium user to add more than 3 module to your shopping list."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        shopping_list_item, created = UserShoppingList.objects.get_or_create(
            user=user,
            component=component,
            bom_item=module_bom_list_item,
            module=module_obj,
            defaults={"quantity": quantity},
        )

        if not created:
            if edit_mode:
                shopping_list_item.quantity = quantity
            else:
                shopping_list_item.quantity += quantity
            shopping_list_item.save()

        serializer = UserShoppingListSerializer(shopping_list_item)
        status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
        return Response(serializer.data, status=status_code)

    def patch(self, request, component_pk):
        """
        Update a module-specific component in the user's shopping list.
        """

        user = request.user
        quantity = int(request.data.get("quantity", 0))

        if quantity <= 0:
            return Response(
                {"detail": "Quantity must be greater than zero."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        module_bom_list_item_pk = request.data.get("modulebomlistitem_pk", None)

        module_pk = request.data.get("module_pk", None)

        if not module_bom_list_item_pk or not module_pk:
            shopping_list_item = (
                UserShoppingList.objects.filter(
                    component__id=component_pk,
                    user=user,
                )
                .exclude(module__isnull=False)
                .exclude(bom_item__isnull=False)
            ).first()
        else:
            shopping_list_item = (
                UserShoppingList.objects.filter(
                    user=user,
                    component__id=component_pk,
                    bom_item__id=module_bom_list_item_pk,
                    module__id=module_pk,
                )
                .exclude(module__isnull=True)
                .exclude(bom_item__isnull=True)
                .first()
            )

        if not shopping_list_item:
            return Response(
                {"detail": "Shopping list item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        shopping_list_item.quantity = quantity
        shopping_list_item.save()

        serializer = UserShoppingListSerializer(shopping_list_item)

        return Response(serializer.data)

    def delete(self, request, module_pk):
        """
        Endpoint for deleting the shopping list items associated with a specific module.
        """
        user = request.user
        shopping_list_items = UserShoppingList.objects.filter(
            user=user, module__id=module_pk
        )

        if not shopping_list_items:
            return Response(
                {"detail": "Shopping list item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        shopping_list_items.delete()
        return Response(
            {"detail": "Shopping list item deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


class UserAnonymousShoppingListView(APIView):
    """
    View for handling anonymous items in the user's shopping list.
    Anonymous items are items without a module and bom_item.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request, component_pk):
        """
        Endpoint for creating or updating an anonymous item in the user's shopping list.
        'Anonymous' refers to items without a module and bom_item.
        If an anonymous shopping list item with the provided component_pk exists, the quantity of the item is updated based on the 'editMode':
        - If 'editMode' is True or not provided, the quantity is set to the value provided in 'quantity'.
        - If 'editMode' is False, the provided 'quantity' is added to the current quantity of the item.
        If no anonymous shopping list item with the provided component_pk exists, a new item is created with the provided 'quantity'.
        """
        user = request.user
        quantity = int(request.data.get("quantity", 0))

        # Determine the editing mode from request
        edit_mode = request.data.get("editMode", True)

        try:
            component = Component.objects.get(pk=component_pk)
        except Component.DoesNotExist:
            return Response(
                {"detail": "Component not found."}, status=status.HTTP_404_NOT_FOUND
            )

        shopping_list_item = (
            UserShoppingList.objects.filter(user=user, component=component)
            .exclude(module__isnull=False)
            .exclude(bom_item__isnull=False)
            .first()
        )
        if shopping_list_item is not None:
            if edit_mode:
                shopping_list_item.quantity = quantity
            else:
                shopping_list_item.quantity += quantity
            shopping_list_item.save()
        else:
            shopping_list_item = UserShoppingList.objects.create(
                user=user, component=component, quantity=quantity
            )

        serializer = UserShoppingListSerializer(shopping_list_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        user = request.user
        shopping_list_item = UserShoppingList.objects.filter(user=user).exclude(
            module__isnull=False
        )

        if not shopping_list_item:
            return Response(
                {"detail": "Shopping list item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        shopping_list_item.delete()
        return Response(
            {"detail": "Shopping list item deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


class ArchivedShoppingListsView(APIView):
    """
    Retrieve the archived shopping lists for the authenticated user.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user

            # Use prefetch_related to handle optional related notes
            saved_lists = (
                UserShoppingListSaved.objects.filter(user=user)
                .prefetch_related("notes")
                .order_by("-time_saved")
            )

            # If no saved lists are available, return an empty list
            if not saved_lists.exists():
                return Response([], status=status.HTTP_200_OK)

            # Serialize the data
            serializer = UserShoppingListSavedSerializer(saved_lists, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)

        except ObjectDoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """
        Add the archived shopping list with the specified timestamp to the user's shopping list.
        """

        timestamp = request.data.get("timestamp", "")

        if not timestamp:
            return Response(
                {"error": "No timestamp provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = request.user

            # Parse the timestamp string into a datetime object
            try:
                timestamp = timezone.datetime.strptime(
                    timestamp, "%Y-%m-%dT%H:%M:%S.%fZ"
                )
            except ValueError:
                return Response(
                    {
                        "error": "Invalid timestamp format. Expected format: 'YYYY-MM-DDTHH:MM:SS.ssssssZ'."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Retrieve the archived shopping list with the specified timestamp
            archived_list = UserShoppingListSaved.objects.filter(
                user=user, time_saved=timestamp
            )

            # If archived list with specified timestamp does not exist
            if not archived_list.exists():
                return Response(
                    {"error": "Archived list with specified timestamp not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Iterate through the items in the archived list
            for archived_item in archived_list:
                # Check if an item with the same component and module already exists in the shopping list
                existing_item = UserShoppingList.objects.filter(
                    user=user,
                    component=archived_item.component,
                    module=archived_item.module,
                ).first()

                # If the item exists in the shopping list, update the quantity
                if existing_item:
                    existing_item.quantity = F("quantity") + archived_item.quantity
                    existing_item.save()
                # If the item does not exist, create a new item in the shopping list
                else:
                    new_item = UserShoppingList(
                        user=user,
                        component=archived_item.component,
                        module=archived_item.module,
                        quantity=archived_item.quantity,
                    )
                    new_item.save()

            return Response(
                {
                    "message": "Archived list added to the current shopping list successfully."
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def delete(self, request, timestamp):
        try:
            user = request.user

            # Parse the timestamp string into a datetime object
            try:
                timestamp = timezone.datetime.strptime(
                    timestamp, "%Y-%m-%dT%H:%M:%S.%fZ"
                )
            except ValueError:
                return Response(
                    {
                        "error": "Invalid timestamp format. Expected format: 'YYYY-MM-DDTHH:MM:SS.ssssssZ'."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Retrieve the archived shopping list with the specified timestamp
            archived_list = UserShoppingListSaved.objects.filter(
                user=user, time_saved=timestamp
            )

            # If archived list with specified timestamp does not exist
            if not archived_list.exists():
                return Response(
                    {"error": "Archived list with specified timestamp not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Delete the archived shopping list
            archived_list.delete()

            return Response(
                {"message": "Archived list deleted successfully"},
                status=status.HTTP_200_OK,
            )

        except ObjectDoesNotExist:
            return Response(
                {"error": "User not found."}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# tests
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_shopping_list_quantity(
    request, component_pk, modulebomlistitem_pk, module_pk
):
    try:
        shopping_list_item = UserShoppingList.objects.filter(
            component__id=component_pk,
            module__id=module_pk,
            bom_item__id=modulebomlistitem_pk,
            user=request.user,
        )

        # Check if inventory exists
        if shopping_list_item.exists():
            # Access the first inventory object in the QuerySet
            # and retrieve the 'quantity' attribute
            quantity = shopping_list_item.first().quantity
            return Response({"quantity": quantity}, status=status.HTTP_200_OK)
        else:
            return Response({"quantity": 0}, status=status.HTTP_200_OK)
    except Exception as e:
        # Handle invalid parameters or unexpected errors
        return Response(
            {"error": f"An error occurred: {str(e)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_anonymous_shopping_list_quantity(request, component_pk):
    aggregate = request.query_params.get("aggregate", True)

    if aggregate:
        shopping_list_items = UserShoppingList.objects.filter(
            component__id=component_pk,
            user=request.user,
        )

        if shopping_list_items.exists():
            quantity = shopping_list_items.aggregate(Sum("quantity"))["quantity__sum"]
            return Response({"quantity": quantity}, status=status.HTTP_200_OK)
        else:
            return Response({"quantity": 0}, status=status.HTTP_200_OK)
    else:
        shopping_list_item = (
            UserShoppingList.objects.filter(
                component__id=component_pk,
                user=request.user,
            )
            .exclude(module__isnull=False)
            .exclude(bom_item__isnull=False)
        )

        # Check if inventory exists
        if shopping_list_item.exists():
            # Access the first inventory object in the QuerySet
            # and retrieve the 'quantity' attribute
            quantity = shopping_list_item.first().quantity
            return Response({"quantity": quantity}, status=status.HTTP_200_OK)
        else:
            return Response({"quantity": 0}, status=status.HTTP_200_OK)


# tests
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_shopping_list_total_price(request):
    """
    This GET endpoint calculates:
    - total_min_price: The cheapest total cost for the shopping cart.
    - total_max_price: The most expensive total cost for the shopping cart.
    - total_price (deprecated): The total cost using the `unit_price` field of `Component`.
    """

    # Get all shopping list items for the user
    shopping_list_items = UserShoppingList.objects.filter(user=request.user)

    if not shopping_list_items.exists():
        return Response(
            {"detail": "No components in shopping list."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Aggregate quantities for each component in the shopping list
    component_quantities = shopping_list_items.values("component").annotate(
        total_quantity=Sum("quantity")
    )

    # Get all supplier items for the components in the shopping list
    supplier_items = ComponentSupplierItem.objects.filter(
        component__in=component_quantities.values_list("component", flat=True)
    )

    if not supplier_items.exists():
        return Response(
            {
                "total_min_price": Decimal("0.00"),
                "total_max_price": Decimal("0.00"),
                "total_price": Decimal("0.00"),
            },
            status=status.HTTP_200_OK,
        )

    # Aggregate min and max unit prices for each component
    supplier_prices = supplier_items.values("component").annotate(
        min_price=Min("unit_price"),
        max_price=Max("unit_price"),
    )

    # Build a dictionary for quick lookup
    supplier_price_map = {price["component"]: price for price in supplier_prices}

    # Calculate total min and max prices
    total_min_price = Decimal("0.00")
    total_max_price = Decimal("0.00")

    for comp in component_quantities:
        component_id = comp["component"]
        total_quantity = comp["total_quantity"]

        # Fetch prices
        min_price = supplier_price_map.get(component_id, {}).get(
            "min_price", Decimal("0.00")
        )
        max_price = supplier_price_map.get(component_id, {}).get(
            "max_price", Decimal("0.00")
        )

        # Calculate totals
        total_min_price += Decimal(min_price) * total_quantity
        total_max_price += Decimal(max_price) * total_quantity

    # Deprecated price calculation using `unit_price` from the `Component`
    deprecated_total_price = shopping_list_items.aggregate(
        total_price=Sum(F("quantity") * F("component__unit_price"))
    )["total_price"] or Decimal("0.00")

    # Return the response
    response_data = {
        "total_min_price": total_min_price.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "total_max_price": total_max_price.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
        "total_price": deprecated_total_price or Decimal("0.00"),  # Deprecated
    }

    return Response(response_data, status=status.HTTP_200_OK)


# tests
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_shopping_list_total_component_price(request, component_pk):
    """
    This GET endpoint calculates:
    - total_min_price: The cheapest total cost for a specific component in the shopping list.
    - total_max_price: The most expensive total cost for the specific component.
    - total_price (deprecated): The total cost using the `unit_price` field of the `Component`.
    """
    try:
        # Fetch the component by primary key
        component = Component.objects.get(pk=component_pk)
    except Component.DoesNotExist:
        return Response(
            {"detail": "Component not found."}, status=status.HTTP_404_NOT_FOUND
        )

    # Filter shopping list items for the specific user and component
    shopping_list_items = UserShoppingList.objects.filter(
        user=request.user, component=component
    )

    if not shopping_list_items.exists():
        return Response(
            {"detail": "No shopping list items found for the specified component."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Get supplier items for the component
    supplier_items = ComponentSupplierItem.objects.filter(component=component)

    if not supplier_items.exists():
        return Response(
            {
                "total_min_price": Decimal("0.00"),
                "total_max_price": Decimal("0.00"),
                "total_price": Decimal("0.00"),
            },
            status=status.HTTP_200_OK,
        )

    # Calculate min and max unit prices
    supplier_prices = supplier_items.aggregate(
        min_unit_price=Min("unit_price"),
        max_unit_price=Max("unit_price"),
    )

    min_unit_price = supplier_prices["min_unit_price"] or Decimal("0.00")
    max_unit_price = supplier_prices["max_unit_price"] or Decimal("0.00")

    # Fetch total quantity
    total_quantity = shopping_list_items.aggregate(total_quantity=Sum("quantity")).get(
        "total_quantity", 0
    )

    # Calculate total prices
    total_min_price = (min_unit_price * Decimal(total_quantity)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )
    total_max_price = (max_unit_price * Decimal(total_quantity)).quantize(
        Decimal("0.01"), rounding=ROUND_HALF_UP
    )

    # Deprecated price calculation using the component's unit_price
    deprecated_total_price = shopping_list_items.aggregate(
        total_price=Sum(F("quantity") * F("component__unit_price"))
    )["total_price"] or Decimal("0.00")

    # Construct response
    response_data = {
        "total_min_price": total_min_price,
        "total_max_price": total_max_price,
        "total_price": deprecated_total_price.quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        ),
    }

    return Response(response_data, status=status.HTTP_200_OK)


# tests
@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_shopping_list_total_quantity(request):
    # Get all the shopping list items for the user
    shopping_list_items = UserShoppingList.objects.filter(user=request.user)

    # Check if user has any items in shopping list
    if not shopping_list_items.exists():
        return Response(
            {"detail": "No components in shopping list."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Calculate total quantity of all components for the user
    total_quantity = shopping_list_items.aggregate(total_quantity=Sum("quantity"))[
        "total_quantity"
    ]

    return Response({"total_quantity": total_quantity}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_component_to_inventory(request, component_pk):
    user = request.user
    quantity = request.data.get("quantity")
    location = request.data.get("location")

    # Convert location string to a list, if provided
    location_list = location.split(",") if location else None

    # Validate and set quantity
    if quantity:
        try:
            quantity = int(quantity)
        except ValueError:
            return Response(
                {"detail": "Invalid quantity."}, status=status.HTTP_400_BAD_REQUEST
            )

    # Use a database transaction to ensure atomicity
    with transaction.atomic():
        # Check for existing inventory item with the specified location
        if location_list is not None:
            user_inventory_items = UserInventory.objects.filter(
                user=user, component_id=component_pk, location__exact=location_list
            )
        else:
            user_inventory_items = UserInventory.objects.filter(
                user=user, component__id=component_pk, location__isnull=True
            )

        if user_inventory_items.exists():
            inventory_item = user_inventory_items.first()
            inventory_item.quantity += quantity
            inventory_item.save()
        else:
            # Create a new inventory item with the specified location and quantity
            UserInventory.objects.create(
                user=user,
                component_id=component_pk,
                quantity=quantity,
                location=location_list,
            )

        # Delete the item from the shopping list
        UserShoppingList.objects.filter(user=user, component_id=component_pk).delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_all_user_shopping_list_to_inventory(request):
    user = request.user
    shopping_list = UserShoppingList.objects.filter(user=user)

    # Ensure location_list is a dictionary
    if not isinstance(request.data, dict):
        return Response(
            {"detail": "Invalid data format; expected a dictionary of locations."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    location_list = request.data

    for shopping_list_item in shopping_list:
        component_id = str(shopping_list_item.component.id)
        shopping_list_item_location = location_list.get(component_id, None)

        if shopping_list_item_location is not None:
            user_inventory_items = UserInventory.objects.filter(
                user=user,
                component_id=shopping_list_item.component.id,
                location__exact=shopping_list_item_location,
            )
        else:
            user_inventory_items = UserInventory.objects.filter(
                user=user,
                component__id=shopping_list_item.component.id,
                location__isnull=True,
            )

        # Get the total quantity of a component from user's shopping list
        shopping_list_quantity = UserShoppingList.objects.filter(
            user=user, component__id=shopping_list_item.component.id
        )

        quantity = sum(item.quantity for item in shopping_list_quantity)

        # If the user has that item in their inventory
        if user_inventory_items.exists():
            inventory_item = user_inventory_items.first()
            inventory_item.quantity += quantity
            inventory_item.save()
        else:
            # Create a new inventory item with the specified location and quantity
            UserInventory.objects.create(
                user=user,
                component_id=shopping_list_item.component.id,
                quantity=quantity,
                location=shopping_list_item_location,
            )

    UserShoppingList.objects.filter(user=user).delete()

    return Response(
        {
            "detail": "Inventory updated successfully.",
            "processed_items": len(shopping_list),
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def archive_shopping_list(request):
    user = request.user

    if not UserShoppingList.objects.filter(user=user).exists():
        return Response(
            {"error": "No items in shopping list."}, status=status.HTTP_400_BAD_REQUEST
        )

    shopping_list = UserShoppingList.objects.filter(user=user).select_related(
        "module", "bom_item", "component"
    )
    time_now = timezone.now()

    notes_content = bleach.clean(request.data.get("notes", ""))

    if len(notes_content) > 1000:
        return Response(
            {"error": "Notes must be no longer than 1000 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Initialize variable to hold a single UserNotes instance
    notes = None

    for index, item in enumerate(shopping_list):
        try:
            with transaction.atomic():
                saved_item = UserShoppingListSaved(
                    time_saved=time_now,
                    module=item.module,
                    bom_item=item.bom_item,
                    component=item.component,
                    user=item.user,
                    quantity=item.quantity,
                    name=item.component.description,
                )
                saved_item.save()

                # Create a single UserNotes instance if needed and link it
                if notes_content and notes is None:
                    notes = UserNotes.objects.create(
                        note=notes_content,
                        user_shopping_list_saved=saved_item,  # Link to satisfy constraints
                    )

                saved_item.notes = notes
                saved_item.save(update_fields=["notes"])

        except Exception as e:
            return Response(
                {"error": "An error occurred while saving items or notes."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    return Response(
        {"message": "Shopping List saved successfully with one note"},
        status=status.HTTP_200_OK,
    )


# tests
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_unique_component_ids(request):
    user = request.user
    shopping_list = UserShoppingList.objects.filter(user=user)
    # Convert UUIDs to strings
    component_ids = list(
        map(str, shopping_list.values_list("component_id", flat=True).distinct())
    )
    return Response(component_ids, status=status.HTTP_200_OK)
