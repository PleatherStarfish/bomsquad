from accounts.serializers import UserHistorySerializer, UserSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.db.transaction import non_atomic_requests
from django.http import HttpResponse
from .models import KofiPayment
from datetime import datetime
from uuid import UUID
import logging
import json
import os

logger = logging.getLogger(__name__)


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
