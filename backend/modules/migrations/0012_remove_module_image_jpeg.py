# Generated by Django 4.1.5 on 2024-08-05 03:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('modules', '0011_remove_module_image_remove_module_image_jpeg_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='module',
            name='image_jpeg',
        ),
    ]
