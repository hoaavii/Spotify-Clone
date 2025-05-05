from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Song(models.Model):
    ACCESS_TIER_CHOICES = [
        ('FREE', 'Free'),
        ('PRO', 'Pro only'),
        ('PREMIUM', 'Premium only'),
    ]
    access_tier = models.CharField(
        max_length=10,
        choices=ACCESS_TIER_CHOICES,
        default='FREE',
        help_text='Who can listen: Free, Pro or Premium subscribers'
    )

    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_songs'
    )
    title       = models.CharField(max_length=200)
    artist      = models.CharField(max_length=200)
    album       = models.CharField(max_length=200, blank=True)
    audio_file  = models.FileField(upload_to='songs/')
    is_approved = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} — {self.artist}"


class Video(models.Model):
    ACCESS_TIER_CHOICES = [
        ('FREE', 'Free'),
        ('PRO', 'Pro only'),
        ('PREMIUM', 'Premium only'),
    ]
    access_tier = models.CharField(
        max_length=10,
        choices=ACCESS_TIER_CHOICES,
        default='FREE',
        help_text='Who can watch: Free, Pro or Premium subscribers'
    )

    title       = models.CharField(max_length=200)
    artist      = models.CharField(max_length=200)
    video_file  = models.FileField(upload_to='videos/')
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='uploaded_videos'
    )
    is_approved = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class Album(models.Model):
    name       = models.CharField(max_length=200)
    owner      = models.ForeignKey(User, on_delete=models.CASCADE)
    songs      = models.ManyToManyField(Song, blank=True, related_name='albums')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Favorite(models.Model):
    user     = models.ForeignKey(User, on_delete=models.CASCADE)
    song     = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='favorites')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'song')


class ChatMessage(models.Model):
    sender    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_msgs')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recv_msgs')
    content   = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)


class Comment(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    song       = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='comments')
    content    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} on {self.song.title}"


from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Payment(models.Model):
    STATUS_CHOICES = [
        ('PENDING',   'Pending'),
        ('COMPLETED', 'Completed'),
        ('FAILED',    'Failed'),
    ]

    user            = models.ForeignKey(
                         User,
                         on_delete=models.CASCADE,
                         related_name='payments'
                      )
    plan            = models.CharField(max_length=50)   # e.g. "Pro", "Premium"
    amount          = models.DecimalField(max_digits=8, decimal_places=2)
    status          = models.CharField(
                         max_length=10,
                         choices=STATUS_CHOICES,
                         default='PENDING'
                      )

    # PayOS-specific fields:
    payment_link_id = models.CharField(max_length=100, blank=True)
    checkout_url    = models.URLField(blank=True)

    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.plan} (${self.amount})"

