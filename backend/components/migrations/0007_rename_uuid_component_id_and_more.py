# Generated by Django 4.1.5 on 2023-06-21 06:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0006_remove_component_id_remove_componentmanufacturer_id_and_more'),
    ]

    operations = [
        migrations.RenameField(
            model_name='component',
            old_name='uuid',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='componentmanufacturer',
            old_name='uuid',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='componentsupplier',
            old_name='uuid',
            new_name='id',
        ),
        migrations.RenameField(
            model_name='types',
            old_name='uuid',
            new_name='id',
        ),
    ]
