# music_app/urls.py

from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView
)

from .views import (
    RegisterAPIView,
    LoginAPIView,
    CurrentUserAPIView,
    UserViewSet,
    SongViewSet,
    VideoViewSet,
    AlbumViewSet,
    FavoriteViewSet,
    ChatMessageViewSet,
    CommentViewSet,
    PaymentViewSet,
    TopFavoritesAPIView,
    AdminStatsAPIView,
    SongSearchAPIView,
    DiscoverySongAPIView,
)
from .consumers import ChatConsumer
from .views import payos_webhook

router = DefaultRouter()
router.register(r'users',     UserViewSet,           basename='user')
router.register(r'songs',     SongViewSet,           basename='song')
router.register(r'videos',    VideoViewSet,          basename='video')
router.register(r'albums',    AlbumViewSet,          basename='album')
router.register(r'favorites', FavoriteViewSet,      basename='favorite')
router.register(r'chat',      ChatMessageViewSet,    basename='chat')
router.register(r'comments',  CommentViewSet,        basename='comment')
router.register(r'payments',  PaymentViewSet,        basename='payment')

urlpatterns = [
    # ── Auth ───────────────────────────────────────────────────
    path('auth/register/',      RegisterAPIView.as_view(),     name='register'),
    path('auth/token/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(),   name='token_refresh'),
    path('auth/token/verify/',  TokenVerifyView.as_view(),    name='token_verify'),
    path('auth/login/',         LoginAPIView.as_view(),        name='login'),
    path('auth/user/',          CurrentUserAPIView.as_view(),  name='current-user'),

    # ── Current user (must come before the router’s /users/ routes) ──
    path('users/me/',           CurrentUserAPIView.as_view(),  name='current-user'),
    path('payments/webhook/', payos_webhook, name='payos-webhook'),

    # ── Payment & Stats ───────────────────────────────────────
    path('payment-stats/',      AdminStatsAPIView.as_view(),   name='payment-stats'),
    path('admin-stats/',        AdminStatsAPIView.as_view(),   name='admin-stats'),

    # ── Dashboards & Search ──────────────────────────────────
    path('top-favorites/',      TopFavoritesAPIView.as_view(), name='top-favorites'),
    path('songs/search/',       SongSearchAPIView.as_view(),   name='song-search'),
    path('songs/discover/',     DiscoverySongAPIView.as_view(),name='song-discover'),

    # ── Include all the standard CRUD endpoints from the router ──
    path('', include(router.urls)),
]

# WebSocket chat route (Channels)
websocket_urlpatterns = [
    re_path(r'ws/chat/(?P<other_id>\d+)/$', ChatConsumer.as_asgi()),
]
