# Generated by Django 4.2 on 2024-09-01 14:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tournament', '0006_match_controls_mode'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='match',
            name='can_create_match',
        ),
    ]
