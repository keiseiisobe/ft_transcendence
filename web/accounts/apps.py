from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField' # pyright: ignore [reportAssignmentType]
    name = 'accounts'
