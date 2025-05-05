# views.py

import os
from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Song, Video, Album, Favorite, ChatMessage, Comment, Payment
from .serializers import (
    RegisterSerializer, UserSerializer, SongSerializer,
    VideoSerializer, AlbumSerializer, FavoriteSerializer,
    ChatMessageSerializer, CommentSerializer,
    PaymentSerializer, AdminStatsSerializer
)
from payos import PayOS, ItemData, PaymentData

User = get_user_model()

# ── AUTH ───────────────────────────────────────────

class RegisterAPIView(generics.CreateAPIView):
    queryset         = User.objects.none()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginAPIView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]

class CurrentUserAPIView(generics.RetrieveAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

# ── USER VIEWSET ───────────────────────────────────

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset             = User.objects.all()
    serializer_class     = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated]

# ── TOP FAVORITES ───────────────────────────────────

class TopFavoritesAPIView(generics.ListAPIView):
    queryset             = (
        Song.objects.filter(is_approved=True)
                    .annotate(fav_count=Count('favorites'))
                    .order_by('-fav_count')[:10]
    )
    serializer_class     = SongSerializer
    permission_classes   = [permissions.AllowAny]

# ── ADMIN STATS ─────────────────────────────────────

class AdminStatsAPIView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        data = {
            'user_count':    User.objects.count(),
            'sale_count':    Favorite.objects.count(),
            'songs_count':   Song.objects.count(),
            'albums_count':  Album.objects.count(),
            'total_revenue': (
                Payment.objects.filter(status='COMPLETED')
                       .aggregate(total=Sum('amount'))['total']
                or Decimal('0.00')
            ),
        }
        return Response(AdminStatsSerializer(data).data)

# ── SEARCH & DISCOVERY ──────────────────────────────

class SongSearchAPIView(generics.ListAPIView):
    serializer_class   = SongSerializer
    permission_classes = [permissions.AllowAny]
    def get_queryset(self):
        q = self.request.query_params.get('q','')
        return Song.objects.filter(is_approved=True, title__icontains=q)

class DiscoverySongAPIView(generics.ListAPIView):
    serializer_class     = SongSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Song.objects.filter(is_approved=True)\
                   .exclude(favorites__user=user)

# ── CRUD VIEWSETS ───────────────────────────────────

class SongViewSet(viewsets.ModelViewSet):
    serializer_class     = SongSerializer
    permission_classes   = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]
    def get_queryset(self):
        qs = Song.objects.all().order_by('-created_at')
        if not self.request.user.is_staff:
            qs = qs.filter(is_approved=True)
        return qs
    def perform_create(self, serializer):
        serializer.save(
            uploaded_by=self.request.user,
            is_approved=self.request.user.is_staff
        )

class VideoViewSet(viewsets.ModelViewSet):
    serializer_class     = VideoSerializer
    permission_classes   = [permissions.IsAuthenticatedOrReadOnly]
    authentication_classes = [JWTAuthentication]
    def get_queryset(self):
        qs = Video.objects.all().order_by('-created_at')
        if not self.request.user.is_staff:
            qs = qs.filter(is_approved=True)
        return qs
    def perform_create(self, serializer):
        serializer.save(
            uploaded_by=self.request.user,
            is_approved=self.request.user.is_staff
        )

class AlbumViewSet(viewsets.ModelViewSet):
    queryset             = Album.objects.all().order_by('-created_at')
    serializer_class     = AlbumSerializer
    permission_classes   = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class       = FavoriteSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes     = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # auto-assign the logged-in user
        serializer.save(user=self.request.user)

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class       = ChatMessageSerializer
    permission_classes     = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        me    = self.request.user
        other = self.request.query_params.get('user')
        return ChatMessage.objects.filter(
            (Q(sender=me) & Q(recipient_id=other)) |
            (Q(sender_id=other) & Q(recipient=me))
        ).order_by('timestamp')

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class       = CommentSerializer
    permission_classes     = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get_queryset(self):
        qs = Comment.objects.all().order_by('-created_at')
        song_id = self.request.query_params.get('song')
        if song_id:
            qs = qs.filter(song_id=song_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset               = Payment.objects.all().order_by('-created_at')
    serializer_class       = PaymentSerializer
    permission_classes     = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    payos = PayOS(
        client_id    = settings.PAYOS_CLIENT_ID,
        api_key      = settings.PAYOS_API_KEY,
        checksum_key = settings.PAYOS_CHECKSUM_KEY,
    )

    def create(self, request, *args, **kwargs):
        user   = request.user
        plan   = request.data.get('plan')
        amount = float(request.data.get('amount'))

        payment = Payment.objects.create(
            user   = user,
            plan   = plan,
            amount = amount,
            status = 'PENDING',
        )

        item = ItemData(
            name     = plan,
            quantity = 1,
            price    = int(amount * 1000),
        )
        pay_data = PaymentData(
            orderCode   = payment.id,
            amount      = int(amount * 100),
            description = f"Upgrade to {plan}",
            items       = [item],
            cancelUrl   = settings.PAYOS_CANCEL_URL,
            returnUrl   = settings.PAYOS_RETURN_URL,
        )

        result = self.payos.createPaymentLink(pay_data)

        payment.payment_link_id = result.paymentLinkId
        payment.checkout_url    = result.checkoutUrl
        payment.status          = result.status
        payment.save()

        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
@api_view(['POST'])
@permission_classes([AllowAny])
def payos_webhook(request):
    """
    PayOS will POST here after checkout is completed/cancelled.
    We look up the Payment by orderCode (which we set to payment.id)
    and update its status accordingly.
    """
    data = request.data
    order_code = data.get('orderCode') or data.get('order_code')
    new_status = data.get('status', '').upper()

    if not order_code or new_status not in ('PENDING','COMPLETED','FAILED'):
        return Response({'detail': 'Invalid payload'}, status=400)

    try:
        payment = Payment.objects.get(id=order_code)
    except Payment.DoesNotExist:
        return Response({'detail': 'Payment not found'}, status=404)

    payment.status = new_status
    payment.save()
    return Response({'detail': 'Payment updated'}, status=200)