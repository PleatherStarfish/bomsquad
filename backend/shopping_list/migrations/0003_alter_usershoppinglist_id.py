# Generated by Django 4.1.5 on 2023-03-22 05:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shopping_list', '0002_rename_userprofileshoppinglistdata_usershoppinglist'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usershoppinglist',
            name='id',
            field=models.BigAutoField(primary_key=True, serialize=False),
        ),
    ]
