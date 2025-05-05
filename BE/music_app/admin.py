from django.contrib import admin
from .models import Song, Video, Album, Favorite

@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    list_display  = ('title', 'artist', 'uploaded_by', 'is_approved', 'created_at')
    list_filter   = ('is_approved', 'uploaded_by')
    search_fields = ('title', 'artist')

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display  = ('title', 'artist', 'uploaded_by', 'is_approved', 'created_at')
    list_filter   = ('is_approved', 'uploaded_by')
    search_fields = ('title', 'artist')

admin.site.register(Album)
admin.site.register(Favorite)
