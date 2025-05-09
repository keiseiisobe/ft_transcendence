from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0012_user_is_login'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='totp_secret',
            field=models.CharField(max_length=32, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='user',
            name='use_totp',
            field=models.BooleanField(default=False),
        ),
    ]
