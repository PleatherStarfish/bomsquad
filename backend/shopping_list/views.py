import bleach
from accounts.models import UserNotes
from components.models import Component
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
from rest_framework.views import APIView


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
        module_bom_list_item_pk = request.data.get("modulebomlistitem_pk", None)
        module_pk = request.data.get("module_pk", None)

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

        if module_bom_list_item_pk is not None:
            module_bom_list_item_pk = int(module_bom_list_item_pk)

        module_pk = request.data.get("module_pk", None)

        if module_pk is not None:
            module_pk = int(module_pk)

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

            # Check if there are saved lists for the user
            saved_lists = UserShoppingListSaved.objects.filter(user=user).order_by(
                "-time_saved"
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


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_shopping_list_quantity(
    request, component_pk, modulebomlistitem_pk, module_pk
):
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


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_shopping_list_total_price(request):
    """
    This GET endpoint calculates the total cost of all components
    in the authenticated user's shopping list.

    It retrieves the user's shopping list items, checks if any exist,
    calculates the total cost by multiplying quantity and price directly in the database,
    and returns this total in a JSON response.
    """

    # Get all the shopping list items for the user
    shopping_list_items = UserShoppingList.objects.filter(user=request.user)

    # Check if user has any items in shopping list
    if not shopping_list_items.exists():
        return Response(
            {"detail": "No components in shopping list."},
            status=status.HTTP_404_NOT_FOUND,
        )

    # Calculate total price of all components for the user
    total_price = shopping_list_items.aggregate(
        total_price=Sum(F("quantity") * F("component__price"))
    )["total_price"]

    return Response({"total_price": total_price}, status=status.HTTP_200_OK)


@permission_classes([IsAuthenticated])
@api_view(["GET"])
def get_user_shopping_list_total_component_price(request, component_pk):
    """
    This GET endpoint calculates the total cost of a specific component ('component_pk')
    in the authenticated user's shopping list.

    It retrieves the component, filters UserShoppingList items for the user and the component,
    calculates the total cost by multiplying the quantity and price directly in the database,
    and returns this total in a JSON response.
    """

    try:
        component = Component.objects.get(pk=component_pk)
    except Component.DoesNotExist:
        return Response(
            {"detail": "Component not found."}, status=status.HTTP_404_NOT_FOUND
        )

    shopping_list_items = UserShoppingList.objects.filter(
        user=request.user, component=component
    )

    total_price = shopping_list_items.annotate(
        total_price=Cast(F("quantity") * F("component__price"), FloatField())
    ).values_list("total_price", flat=True)

    total = sum(total_price)

    return Response({"total_price": total}, status=status.HTTP_200_OK)


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
def add_all_user_shopping_list_to_inventory(request):
    user = request.user
    shopping_list = UserShoppingList.objects.filter(user=user)

    for shopping_list_item in shopping_list:
        inventory_item, created = UserInventory.objects.get_or_create(
            component=shopping_list_item.component,
            user=user,
            defaults={
                "quantity": shopping_list_item.quantity,
            },
        )
        if not created:
            inventory_item.old_quantity = inventory_item.quantity
            inventory_item.old_location = inventory_item.location
            inventory_item.save()
            UserInventory.objects.filter(pk=inventory_item.pk).update(
                quantity=F("quantity") + shopping_list_item.quantity
            )
            inventory_item.refresh_from_db()

        shopping_list_item.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def archive_shopping_list(request):
    user = request.user

    # check if there's something in the shopping list
    if not UserShoppingList.objects.filter(user=user).exists():
        return Response(
            {"error": "No items in shopping list."}, status=status.HTTP_400_BAD_REQUEST
        )

    shopping_list = UserShoppingList.objects.filter(user=user)
    time_now = timezone.now()

    # Get the notes from the request body
    notes_content = request.data.get("notes", "")

    # Sanitize the input with bleach
    notes_content = bleach.clean(notes_content)

    # Validate the length of the notes
    if len(notes_content) > 1000:
        return Response(
            {"error": "Notes must be no longer than 1000 characters."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Create a UserNotes instance only if notes_content has length
    notes = None
    if len(notes_content) > 0:
        try:
            notes = UserNotes.objects.create(user=user, note=notes_content)
        except IntegrityError:
            return Response(
                {"error": "Failed to create UserNotes."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    # Save each item in the shopping list as a UserShoppingListSaved instance
    for item in shopping_list:
        saved_item = UserShoppingListSaved()
        saved_item.time_saved = time_now
        saved_item.module = item.module
        saved_item.bom_item = item.bom_item
        saved_item.component = item.component
        saved_item.user = item.user
        saved_item.quantity = item.quantity
        saved_item.notes = notes  # Associate with the UserNotes instance
        saved_item.save()

    return Response(
        {"message": "Shopping List saved successfully"}, status=status.HTTP_200_OK
    )
