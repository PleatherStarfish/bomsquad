# Generated by Django 5.0 on 2025-03-04 07:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("components", "0034_remove_component_unit_price_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="component",
            name="pin_spacing",
            field=models.CharField(
                blank=True,
                help_text="Component height (e.g., '5mm', '10mm').",
                max_length=10,
                null=True,
            ),
        ),
    ]
