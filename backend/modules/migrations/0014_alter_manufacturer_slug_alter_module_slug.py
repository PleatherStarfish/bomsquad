# Generated by Django 4.1.5 on 2024-08-16 01:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('modules', '0013_alter_manufacturer_options_alter_module_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='manufacturer',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
        migrations.AlterField(
            model_name='module',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
    ]