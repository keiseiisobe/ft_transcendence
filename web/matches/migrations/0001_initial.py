# Generated by Django 4.2 on 2025-03-15 09:50

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('p1_type', models.IntegerField(choices=[(0, 'User'), (1, 'Guest'), (2, 'AI')])),
                ('p1_nickname', models.CharField(max_length=20)),
                ('p1_score', models.IntegerField(default=0)),
                ('p2_type', models.IntegerField(choices=[(0, 'User'), (1, 'Guest'), (2, 'AI')])),
                ('p2_nickname', models.CharField(max_length=20)),
                ('p2_score', models.IntegerField(default=0)),
                ('is_finished', models.BooleanField(default=False)),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('p1_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_p1', to=settings.AUTH_USER_MODEL)),
                ('p2_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_p2', to=settings.AUTH_USER_MODEL)),
                ('tournament', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='matches.tournament')),
            ],
        ),
    ]
