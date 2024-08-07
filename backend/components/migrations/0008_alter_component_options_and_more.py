# Generated by Django 4.1.5 on 2024-08-06 05:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0007_alter_component_supplier_item_no'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='component',
            options={'ordering': ['type', 'mounting_style', 'description'], 'verbose_name_plural': 'Components'},
        ),
        migrations.AlterModelOptions(
            name='componentmanufacturer',
            options={'ordering': ['name'], 'verbose_name_plural': 'Component Manufacturers'},
        ),
        migrations.AlterModelOptions(
            name='types',
            options={'ordering': ['name'], 'verbose_name_plural': 'Types'},
        ),
        migrations.RemoveField(
            model_name='types',
            name='order',
        ),
    ]
