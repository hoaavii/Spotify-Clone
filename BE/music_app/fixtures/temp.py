# temp.py
import os

# point at your settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spotify_clone.settings')

import django
django.setup()

from django.contrib.auth.hashers import make_password

print(make_password("Admin123!"))
