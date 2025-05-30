# Generated by Django 5.0 on 2024-11-27 07:10

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0021_remove_component_user_submission_hold_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='component',
            name='submitted_by',
            field=models.ForeignKey(blank=True, help_text='User who submitted this component, if user-submitted.', null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='component',
            name='user_submitted_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')], default='approved', max_length=10),
        ),
    ]
