# Generated by Django 4.1.5 on 2023-05-25 02:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('modules', '0014_remove_manufacturer_date_updated_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='module',
            name='discontinued',
            field=models.BooleanField(default=False),
        ),
    ]
