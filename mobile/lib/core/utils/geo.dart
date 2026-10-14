import 'dart:math';

/// Straight-line distance between two points in kilometres (haversine).
double distanceKm(double lat1, double lng1, double lat2, double lng2) {
  const earthRadiusKm = 6371.0;
  double radians(double degrees) => degrees * pi / 180;

  final halfDLat = sin(radians(lat2 - lat1) / 2);
  final halfDLng = sin(radians(lng2 - lng1) / 2);
  final a = halfDLat * halfDLat +
      cos(radians(lat1)) * cos(radians(lat2)) * halfDLng * halfDLng;
  return earthRadiusKm * 2 * atan2(sqrt(a), sqrt(1 - a));
}
