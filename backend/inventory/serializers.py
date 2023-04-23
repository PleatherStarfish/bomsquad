from components.serializers import ComponentSerializer
from rest_framework import serializers
from inventory.models import UserInventory
import json


class UserInventorySerializer(serializers.ModelSerializer):
    component = ComponentSerializer()

    def update(self, instance, validated_data):
        if "location" in validated_data:
            location_data = validated_data.get("location")
            location_list = location_data.split(",")
            validated_data["location"] = location_list

        return super().update(instance, validated_data)

    class Meta:
        model = UserInventory
        fields = ("user", "component", "quantity", "location")
