# Generated by Django 4.1.5 on 2023-06-25 04:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_alter_customuser_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='datetime_updated',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
