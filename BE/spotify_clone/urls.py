from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Redirect the root URL (/) to the DRF API root at /api/
    path('', RedirectView.as_view(url='/api/', permanent=False)),

    # Admin site
    path('admin/', admin.site.urls),

    # Your app’s API
    path('api/', include('music_app.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
