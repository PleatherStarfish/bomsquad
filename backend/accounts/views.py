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
from django.views.decorators.csrf import csrf_exempt
from django.db.transaction import non_atomic_requests
from django.http import HttpResponse
from .models import CustomUser, KofiPayment, UserNotes, WantToBuildModules, BuiltModules
from datetime import datetime, timedelta
from django.core.exceptions import ValidationError
from decimal import Decimal
from uuid import UUID
import logging
import json
import os

logger = logging.getLogger(__name__)


def convert_to_usd(amount, currency):
    # TODO: replace hardcoded conversion rates with API
    conversion_rates = {
        "USD": 1.0,
        "EUR": 0.85,
        "JPY": 110.5,
        "GBP": 0.72,
        "AUD": 1.30,
        "CAD": 1.25,
        "CHF": 0.92,
        "CNY": 6.45,
        "INR": 73.5,
        "BRL": 5.25,
    }

    if currency not in conversion_rates:
        logger.warning(f"Unknown currency: {currency}")
        return None  # Handle unknown currencies

    return amount / conversion_rates[currency]


@api_view(["GET"])
def get_user_me(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)


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

    def delete(self, request, pk):
        try:
            instance = UserNotes.objects.get(pk=pk, user=request.user)
        except UserNotes.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
