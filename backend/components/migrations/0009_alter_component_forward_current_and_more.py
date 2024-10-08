# Generated by Django 4.1.5 on 2024-08-13 20:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('components', '0008_alter_component_options_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='component',
            name='forward_current',
            field=models.CharField(blank=True, help_text='The maximum forward current of the component.', max_length=6, null=True),
        ),
        migrations.AlterField(
            model_name='component',
            name='forward_current_avg_rectified',
            field=models.CharField(blank=True, help_text='The average forward current over a full cycle of an AC signal.', max_length=6, null=True),
        ),
        migrations.AlterField(
            model_name='component',
            name='forward_surge_current',
            field=models.CharField(blank=True, help_text='The maximum forward surge current of the component.', max_length=6, null=True),
        ),
        migrations.AlterField(
            model_name='component',
            name='forward_voltage',
            field=models.CharField(blank=True, help_text='The forward voltage drop of the component.', max_length=6, null=True),
        ),
        migrations.AlterField(
            model_name='component',
            name='tolerance',
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
    ]
