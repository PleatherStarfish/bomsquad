# Generated by Django 4.1.5 on 2023-07-13 02:59

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('components', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='UserInventory',
            fields=[
                ('datetime_updated', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('quantity', models.PositiveIntegerField(default=0)),
                ('location', models.JSONField(blank=True, null=True)),
                ('old_quantity', models.PositiveIntegerField(default=0)),
                ('old_location', models.JSONField(blank=True, null=True)),
                ('component', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='components.component')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name_plural': 'User Component Inventory',
            },
        ),
        migrations.AddIndex(
            model_name='userinventory',
            index=models.Index(fields=['user'], name='inventory_u_user_id_446a44_idx'),
        ),
        migrations.AddIndex(
            model_name='userinventory',
            index=models.Index(fields=['user', 'component'], name='inventory_u_user_id_d9ce30_idx'),
        ),
        migrations.AlterUniqueTogether(
            name='userinventory',
            unique_together={('user', 'component')},
        ),
    ]
