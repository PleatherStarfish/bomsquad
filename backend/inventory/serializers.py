from components.serializers import ComponentSerializer
from rest_framework import serializers
from inventory.models import UserInventory


class UserInventorySerializer(serializers.ModelSerializer):
    component = ComponentSerializer()

    class Meta:
        model = UserInventory
        fields = ("component", "quantity", "location")
