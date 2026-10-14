/// Where the app looks for parking until it can read the phone's location.
///
/// Reading the GPS position needs the location permission flow, and turning
/// coordinates into an area name needs a geocoding service, so for now the
/// home screen uses central Sulaymaniyah.
class DefaultLocation {
  DefaultLocation._();

  static const double latitude = 35.5571;
  static const double longitude = 45.4356;
  static const String areaName = 'Downtown, Sulaymaniyah';

  /// How far "near you" reaches, in kilometres.
  static const double searchRadiusKm = 5;
}
