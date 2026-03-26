from rest_framework.views import APIView
from rest_framework.response import Response
from .models import PlaceCache
from utils.image_service import get_place_photo


class PlaceSearchView(APIView):
    def get(self, request):
        q = request.query_params.get('q', '')
        dest = request.query_params.get('dest', '')
        qs = PlaceCache.objects.all()
        if q:
            qs = qs.filter(name__icontains=q)
        if dest:
            qs = qs.filter(destination__icontains=dest)
        places = list(qs[:20].values())
        return Response({'results': places})


class PlacePhotosView(APIView):
    def get(self, request, pk):
        try:
            place = PlaceCache.objects.get(pk=pk)
        except PlaceCache.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        if not place.photo_urls:
            place.photo_urls = [get_place_photo(place.name)]
            place.save()
        return Response({'photos': place.photo_urls})
