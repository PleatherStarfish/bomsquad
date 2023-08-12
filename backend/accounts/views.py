from accounts.serializers import UserHistorySerializer, UserSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
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
def kofi_payment_webhook(request):
    verification_token = os.environ.get("KO_FI_VERIFICATION_TOKEN")
    if not verification_token:
        logger.warning("KO_FI_VERIFICATION_TOKEN is not set")
        return HttpResponse(status=400)

    data = request.POST.get("data")
    if data:
        data_json = json.loads(data)
        received_verification_token = data_json.get("verification_token")

        if received_verification_token != verification_token:
            logger.warning("Invalid verification token received in webhook")
            return HttpResponse(status=400)

        email = data_json.get("email")
        tier_name = data_json.get("tier_name")
        kofi_transaction_id_str = data_json.get("kofi_transaction_id")
        timestamp_str = data_json.get("timestamp")
        is_subscription_payment = bool(data_json.get("is_subscription_payment"))

        try:
            kofi_transaction_id = (
                UUID(kofi_transaction_id_str) if kofi_transaction_id_str else None
            )
        except ValueError:
            return HttpResponse(status=400)

        try:
            timestamp = datetime.fromisoformat(timestamp_str) if timestamp_str else None
        except ValueError:
            return HttpResponse(status=400)

        if not email or not timestamp or not kofi_transaction_id:
            logger.warning("Missing data in webhook request")
            return HttpResponse(status=400)

        if not is_subscription_payment:
            logger.info("Non-subscription payment by %s", email)
            return HttpResponse(status=200)

        # Create or update the record
        KofiPayment.objects.update_or_create(
            kofi_transaction_id=kofi_transaction_id,
            defaults={"email": email, "tier_name": tier_name, "timestamp": timestamp},
        )

        return HttpResponse(status=200)

    logger.warning("Missing data in webhook request")
    return HttpResponse(status=400)
