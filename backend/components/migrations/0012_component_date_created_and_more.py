# Generated by Django 5.0 on 2024-11-14 15:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("components", "0011_component_user_submission_hold"),
    ]

    operations = [
        migrations.AddField(
            model_name="component",
            name="datetime_created",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name="componentmanufacturer",
            name="datetime_created",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name="componentsupplier",
            name="datetime_created",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name="types",
            name="datetime_created",
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
