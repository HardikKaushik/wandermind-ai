from django.db import models


class PlaceCache(models.Model):
    name = models.CharField(max_length=300)
    destination = models.CharField(max_length=200)
    place_type = models.CharField(max_length=50)
    rating = models.FloatField(default=0)
    review_count = models.IntegerField(default=0)
    photo_urls = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('name', 'destination')

    def __str__(self):
        return f"{self.name} ({self.destination})"
