from accounts.serializers import (
    UserHistorySerializer,
    UserSerializer,
    UserNotesSerializer,
)
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.serializers import UserCurrencySerializer
from django.views.decorators.csrf import csrf_exempt
from django.db.transaction import non_atomic_requests
from django.contrib.auth.models import AnonymousUser
from django.http import HttpResponse
from .models import CustomUser, KofiPayment, UserNotes, WantToBuildModules, BuiltModules
from core.views import get_exchange_rate
from datetime import datetime, timedelta
from django.utils.decorators import method_decorator
from decimal import Decimal
from uuid import UUID
import logging
import json
import os

logger = logging.getLogger(__name__)


def convert_to_usd(amount, currency):
    # TODO: replace hardcoded conversion rates with API
    conversion_rates = {
        "USD": 1.0,  # US Dollar
        "EUR": 0.85,  # Euro
        "JPY": 110.5,  # Japanese Yen
        "GBP": 0.72,  # British Pound
        "AUD": 1.30,  # Australian Dollar
        "CAD": 1.25,  # Canadian Dollar
        "CHF": 0.92,  # Swiss Franc
        "CNY": 6.45,  # Chinese Yuan
        "HKD": 7.8,  # Hong Kong Dollar
        "NZD": 1.4,  # New Zealand Dollar
        "SEK": 8.6,  # Swedish Krona
        "KRW": 1150.0,  # South Korean Won
        "SGD": 1.35,  # Singapore Dollar
        "NOK": 8.9,  # Norwegian Krone
        "INR": 73.5,  # Indian Rupee
    }

    if currency not in conversion_rates:
        logger.warning(f"Unknown currency: {currency}")
        return None  # Handle unknown currencies

    return amount / conversion_rates[currency]


@api_view(["GET"])
def get_user_me(request):
    user = request.user

    # Check if the user is authenticated
    if isinstance(user, AnonymousUser) or not user.is_authenticated:
        return Response(
            {"detail": "Authentication credentials were not provided or are invalid."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    user = request.user
    serializer = UserHistorySerializer(user)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_user(request):
    user = request.user
    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@csrf_exempt
@api_view(["POST"])
@non_atomic_requests
def kofi_payment_webhook(request):
    try:
        verification_token = os.environ.get("KO_FI_VERIFICATION_TOKEN")

        data_json_str = request.POST.get("data")
        if not data_json_str:
            logger.warning("Missing data in webhook request")
            return HttpResponse(status=400)

        data_json = json.loads(data_json_str)

        received_verification_token = data_json.get("verification_token")

        if received_verification_token != verification_token:
            logger.warning("Invalid verification token received in webhook")
            return HttpResponse(status=400)

        # Extract other necessary fields
        email = data_json.get("email", "")
        tier_name = data_json.get("tier_name", "")
        kofi_transaction_id_str = data_json.get("kofi_transaction_id", "")
        timestamp_str = data_json.get("timestamp", "")
        is_subscription_payment = bool(data_json.get("is_subscription_payment", False))
        type = data_json.get("type", "")
        is_public = bool(data_json.get("is_public", False))
        from_name = data_json.get("from_name", "")
        message = data_json.get("message", "")
        amount = data_json.get("amount", "0.00")
        url = data_json.get("url", "")
        currency = data_json.get("currency", "")
        is_first_subscription_payment = bool(
            data_json.get("is_first_subscription_payment", False)
        )

        # Convert fields as needed
        kofi_transaction_id = (
            UUID(kofi_transaction_id_str) if kofi_transaction_id_str else None
        )

        if timestamp_str:
            timestamp_str = timestamp_str.replace("Z", "+00:00")
            try:
                timestamp = datetime.fromisoformat(timestamp_str)
            except ValueError:
                logger.warning("Unknown timestamp format in webhook request")
                return HttpResponse(status=400)

        # Validate required fields
        if not email or not timestamp or not kofi_transaction_id:
            logger.warning("Missing data in webhook request")
            return HttpResponse(status=400)

        # Process non-subscription payment if needed
        if not is_subscription_payment:
            logger.info("Non-subscription payment by %s", email)
            return HttpResponse(status=200)

        amount = Decimal(data_json.get("amount", "0.00"))  # Convert string to decimal

        usd_amount = convert_to_usd(
            amount, currency
        )  # Convert amount to its USD equivalent
        if usd_amount is None:
            logger.warning(f"Failed to convert {amount} {currency} to USD")
            return HttpResponse(status=400)

        # Update user premium_until_via_kofi if a user is found with the given email AND the amount is greater than $3 USD
        if usd_amount >= 3:
            try:
                user = CustomUser.objects.get(email=email)
                user.premium_until_via_kofi = timestamp + timedelta(
                    days=32
                )  # extra day is free :)
                user.save()
            except CustomUser.DoesNotExist:
                logger.warning("No user found for email %s", email)

        # Create or update the record
        KofiPayment.objects.update_or_create(
            kofi_transaction_id=kofi_transaction_id,
            defaults={
                "email": email,
                "tier_name": tier_name,
                "timestamp": timestamp,
                "type": type,
                "is_public": is_public,
                "from_name": from_name,
                "message": message,
                "amount": amount,
                "url": url,
                "currency": currency,
                "is_first_subscription_payment": is_first_subscription_payment,
            },
        )
        return HttpResponse(status=200)

    except json.JSONDecodeError:
        logger.warning("Error decoding JSON data in webhook request")
        return HttpResponse(status=400)


class UserNotesView(APIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self, module, module_type):
        if module_type == "want-to-build":
            return UserNotes.objects.filter(want_to_build_module=module).first()
        elif module_type == "built":
            return UserNotes.objects.filter(built_module=module).first()
        return None

    def get(self, request, module_type, module_id):

        if module_type == "want-to-build":
            module = WantToBuildModules.objects.filter(
                module__id=module_id, user=request.user
            ).first()
        elif module_type == "built":
            module = BuiltModules.objects.filter(
                module__id=module_id, user=request.user
            ).first()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if module is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        note = self.get_queryset(module, module_type)
        if note is None:
            return Response(None)

        serializer = UserNotesSerializer(note)
        return Response(serializer.data)

    def post(self, request, module_type):
        try:
            module_uuid = UUID(request.data["module_id"])
        except ValueError:
            return Response(
                {"error": "Invalid module_id format"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = UserNotesSerializer(data=request.data)
        if serializer.is_valid():
            note = serializer.validated_data["note"]

            if module_type == "want-to-build":
                want_to_build_module = WantToBuildModules.objects.filter(
                    module__id=module_uuid, user=request.user
                ).first()
                if not want_to_build_module:
                    return Response(
                        {"error": "Module not found for user"},
                        status=status.HTTP_404_NOT_FOUND,
                    )
                # Check for existing note
                user_note, created = UserNotes.objects.update_or_create(
                    want_to_build_module=want_to_build_module,
                    defaults={"note": note},
                )
            elif module_type == "built":
                built_module = BuiltModules.objects.filter(
                    module__id=module_uuid, user=request.user
                ).first()
                if not built_module:
                    return Response(
                        {"error": "Module not found for user"},
                        status=status.HTTP_404_NOT_FOUND,
                    )
                # Check for existing note
                user_note, created = UserNotes.objects.update_or_create(
                    built_module=built_module,
                    defaults={"note": note},
                )
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)

            return Response(
                UserNotesSerializer(user_note).data, status=status.HTTP_201_CREATED
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk):
        try:
            instance = UserNotes.objects.get(pk=pk, user=request.user)
        except UserNotes.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = UserNotesSerializer(instance, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, module_type, module_id):
        if module_type == "want-to-build":
            module = WantToBuildModules.objects.filter(
                module__id=module_id, user=request.user
            ).first()
        elif module_type == "built":
            module = BuiltModules.objects.filter(
                module__id=module_id, user=request.user
            ).first()
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if module is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        note = self.get_queryset(module, module_type)
        if note is None:
            return Response(status=status.HTTP_404_NOT_FOUND)

        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_notes(request, module_type):
    notes = {}
    if module_type == "want-to-build":
        modules = WantToBuildModules.objects.filter(user=request.user)
        for module in modules:
            note = UserNotes.objects.filter(want_to_build_module=module).first()
            if note:
                notes[str(module.module.id)] = UserNotesSerializer(note).data["note"]
    elif module_type == "built":
        modules = BuiltModules.objects.filter(user=request.user)
        for module in modules:
            note = UserNotes.objects.filter(built_module=module).first()
            if note:
                notes[str(module.module.id)] = UserNotesSerializer(note).data["note"]
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    return Response(notes, status=status.HTTP_200_OK)


class UserCurrencyView(APIView):
    """
    API endpoint to retrieve, update, and list the authenticated user's chosen default currency.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the user's chosen default currency.
        """
        user = request.user
        default_currency = user.default_currency or "USD"
        exchange_rate = 1.0
        currency_name = "US Dollar"

        if user.is_authenticated:
            try:
                exchange_rate = get_exchange_rate(default_currency)
                currency_name = dict(CustomUser.CURRENCIES).get(
                    default_currency, "Unknown Currency"
                )
            except ValueError:
                pass

        response_data = {
            "default_currency": default_currency,
            "currency_name": currency_name,
            "exchange_rate": exchange_rate,
        }

        return Response(response_data, status=status.HTTP_200_OK)

    def patch(self, request):
        """
        Update the user's default currency and fetch the new exchange rate.
        """
        new_currency = request.data.get("default_currency")

        # Validate the currency
        if not any(new_currency == code for code, _ in CustomUser.CURRENCIES):
            return Response(
                {"error": "Invalid currency code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Retrieve the exchange rate using the provided utility function
            exchange_rate_to_usd = get_exchange_rate(new_currency)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {
                    "error": "An unexpected error occurred while fetching exchange rates."
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Update the user's default currency
        request.user.default_currency = new_currency
        request.user.save()

        return Response(
            {
                "message": "Default currency updated successfully.",
                "default_currency": new_currency,
                "exchange_rate_to_usd": exchange_rate_to_usd,
            },
            status=status.HTTP_200_OK,
        )
