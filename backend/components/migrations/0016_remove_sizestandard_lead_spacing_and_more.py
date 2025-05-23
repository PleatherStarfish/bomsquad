# Generated by Django 5.0 on 2024-11-17 22:56

import django.db.models.deletion
import mptt.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0015_sizestandard_category_component_category_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sizestandard',
            name='lead_spacing',
        ),
        migrations.RemoveField(
            model_name='sizestandard',
            name='type',
        ),
        migrations.AddField(
            model_name='sizestandard',
            name='parent',
            field=mptt.fields.TreeForeignKey(blank=True, help_text='Parent category for this category.', null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='components.sizestandard'),
        ),
    ]
