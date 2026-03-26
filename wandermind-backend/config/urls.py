from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include([
        path('auth/', include('apps.users.urls')),
        path('trips/', include('apps.trips.urls')),
        path('chat/', include('apps.chat.urls')),
        path('places/', include('apps.places.urls')),
        path('budget/', include('apps.budget.urls')),
        path('transport/', include('apps.transport.urls')),
        path('schema/', SpectacularAPIView.as_view(), name='schema'),
        path('docs/', SpectacularSwaggerView.as_view(), name='swagger-ui'),
    ])),
]
