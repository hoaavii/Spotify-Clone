# serializers.py

import os
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.timezone import localtime
from .models import Song, Video, Album, Favorite, ChatMessage, Comment, Payment

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password')

    def create(self, validated):
        user = User(username=validated['username'])
        user.set_password(validated['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    is_staff       = serializers.BooleanField(read_only=True)
    account_status = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'is_staff', 'account_status']

    def get_account_status(self, obj):
        last = obj.payments.filter(status='COMPLETED')\
                           .order_by('-created_at')\
                           .first()
        if not last:
            return None
        return {
            'plan':    last.plan,
            'amount':  last.amount,
            'paid_at': localtime(last.created_at)
        }

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model  = Comment
        fields = ['id', 'user', 'song', 'content', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

class ChatMessageSerializer(serializers.ModelSerializer):
    sender    = serializers.StringRelatedField(read_only=True)
    recipient = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())

    class Meta:
        model  = ChatMessage
        fields = ['id', 'sender', 'recipient', 'content', 'timestamp']
        read_only_fields = ['id', 'sender', 'timestamp']

class SongSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model  = Song
        fields = '__all__'

class VideoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Video
        fields = '__all__'

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Album
        fields = ['id', 'name', 'owner', 'songs']

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Favorite
        fields = ['id', 'user', 'song', 'added_at']
        read_only_fields = ['id', 'user', 'added_at']

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Payment
        fields = [
            'id',
            'plan',
            'amount',
            'status',
            'payment_link_id',
            'checkout_url',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'status',
            'payment_link_id',
            'checkout_url',
            'created_at',
        ]

class AdminStatsSerializer(serializers.Serializer):
    user_count    = serializers.IntegerField()
    sale_count    = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    songs_count   = serializers.IntegerField()
    albums_count  = serializers.IntegerField()
