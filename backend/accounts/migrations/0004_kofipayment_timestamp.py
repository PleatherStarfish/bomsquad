# Generated by Django 4.1.5 on 2023-08-12 16:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_kofipayment'),
    ]

    operations = [
        migrations.AddField(
            model_name='kofipayment',
            name='timestamp',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]