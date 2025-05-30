# Generated by Django 4.1.5 on 2023-07-13 06:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customuser',
            name='default_currency',
            field=models.CharField(blank=True, choices=[('AUD', 'Australian Dollar'), ('AED', 'United Arab Emirates Dirham'), ('BRL', 'Brazilian Real'), ('CAD', 'Canadian Dollar'), ('CHF', 'Swiss Franc'), ('CNH', 'Chinese Yuan'), ('CZK', 'Czech Koruna'), ('DKK', 'Danish Krone'), ('EUR', 'Euro'), ('GBP', 'British Pound'), ('HKD', 'Hong Kong Dollar'), ('HUF', 'Hungarian Forint'), ('IDR', 'Indonesian Rupiah'), ('INR', 'Indian Rupee'), ('ILS', 'Israeli New Shekel'), ('JPY', 'Japanese Yen'), ('KRW', 'South Korean Won'), ('MXN', 'Mexican Peso'), ('MYR', 'Malaysian Ringgit'), ('NOK', 'Norwegian Krone'), ('NZD', 'New Zealand Dollar'), ('PHP', 'Philippine Peso'), ('PLN', 'Polish Złoty'), ('QAR', 'Qatari Riyal'), ('RUB', 'Russian Ruble'), ('SAR', 'Saudi Riyal'), ('SEK', 'Swedish Krona'), ('SGD', 'Singapore Dollar'), ('THB', 'Thai Baht'), ('TRY', 'Turkish Lira'), ('USD', 'US Dollar'), ('ZAR', 'South African Rand')], default='USD', max_length=3),
        ),
        migrations.AlterField(
            model_name='customuser',
            name='username',
            field=models.CharField(blank=True, default='', max_length=30, unique=True),
            preserve_default=False,
        ),
    ]
