#!/usr/bin/env python
import os
import sys

def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spotify_clone.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable?"
        ) from exc

    # ---------------------------------------------------------
    # Initialize Django
    # ---------------------------------------------------------
    import django
    django.setup()

    # ---------------------------------------------------------
    # Only create 'admin1' superuser if auth_user table exists
    # ---------------------------------------------------------
    from django.db import connection
    table_names = connection.introspection.table_names()
    if 'auth_user' in table_names:
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        import datetime

        User = get_user_model()
        if not User.objects.filter(username='admin1').exists():
            admin = User(
                username='admin1',
                email='admin@example.com',
                is_staff=True,
                is_superuser=True,
                is_active=True,
                date_joined=timezone.make_aware(
                    datetime.datetime(2025, 4, 18, 0, 0, 0)
                )
            )
            # Hash the password using Django's utility
            admin.set_password('admin1234')
            admin.save()

    # ---------------------------------------------------------
    # Execute the requested management command
    # ---------------------------------------------------------
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
