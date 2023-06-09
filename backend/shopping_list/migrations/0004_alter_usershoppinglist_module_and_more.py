# Generated by Django 4.1.5 on 2023-04-14 14:46

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('modules', '0008_alter_modulebomlistitem_unique_together_and_more'),
        ('components', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('shopping_list', '0003_alter_usershoppinglist_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='usershoppinglist',
            name='module',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='modules.module'),
        ),
        migrations.AlterUniqueTogether(
            name='usershoppinglist',
            unique_together={('user', 'component', 'bom_item', 'module')},
        ),
        migrations.AddIndex(
            model_name='usershoppinglist',
            index=models.Index(fields=['user'], name='shopping_li_user_id_747579_idx'),
        ),
        migrations.AddIndex(
            model_name='usershoppinglist',
            index=models.Index(fields=['user', 'component'], name='shopping_li_user_id_b36416_idx'),
        ),
        migrations.AddIndex(
            model_name='usershoppinglist',
            index=models.Index(fields=['user', 'component', 'bom_item'], name='shopping_li_user_id_e1a44d_idx'),
        ),
        migrations.AddIndex(
            model_name='usershoppinglist',
            index=models.Index(fields=['user', 'component', 'bom_item', 'module'], name='shopping_li_user_id_0e78e1_idx'),
        ),
    ]
