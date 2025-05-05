import os
import django
import logging

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

# bring in your chat routes
from music_app.urls import websocket_urlpatterns

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'spotify_clone.settings')
django.setup()

# set up logger
logger = logging.getLogger("django")
logger.error("🌐 ASGI APPLICATION BOOTSTRAPPED")
logger.error(f"WebSocket URL patterns: {[str(p.pattern) for p in websocket_urlpatterns]}")

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})
