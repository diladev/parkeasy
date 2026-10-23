import 'dart:math';

import 'package:equatable/equatable.dart';

/// A place on Earth, latitude first (as Google and Apple Maps links expect).
/// Plain Dart, so the domain doesn't depend on a map or GPS package.
class GeoPoint extends Equatable {
  const GeoPoint(this.latitude, this.longitude)
    : assert(latitude >= -90 && latitude <= 90, 'latitude out of range'),
      assert(longitude >= -180 && longitude <= 180, 'longitude out of range');

  final double latitude;
  final double longitude;

  static const double _earthRadiusKm = 6371;

  /// Straight-line ("as the crow flies") distance in kilometres. The route
  /// by road is usually longer.
  double distanceKmTo(GeoPoint other) {
    double radians(double degrees) => degrees * pi / 180;

    final halfDLat = sin(radians(other.latitude - latitude) / 2);
    final halfDLng = sin(radians(other.longitude - longitude) / 2);
    final a =
        halfDLat * halfDLat +
        cos(radians(latitude)) *
            cos(radians(other.latitude)) *
            halfDLng *
            halfDLng;
    return _earthRadiusKm * 2 * atan2(sqrt(a), sqrt(1 - a));
  }

  @override
  List<Object?> get props => [latitude, longitude];
}
