# Generated by Django 4.1.5 on 2023-05-22 17:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shopping_list', '0007_alter_usershoppinglist_unique_together_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usershoppinglist',
            name='quantity',
            field=models.PositiveIntegerField(default=1),
        ),
    ]
