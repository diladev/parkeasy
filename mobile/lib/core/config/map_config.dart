import 'package:mobile/core/constants/default_location.dart';

/// Map tiles and the map's starting view, in one place.
///
/// The tiles are OpenStreetMap's standard map: free and keyless, but only
/// within the OSM Foundation's tile usage policy
/// (https://operations.osmfoundation.org/policies/tiles/). That policy needs
/// an app that identifies itself ([userAgentPackageName]), keeps tiles cached
/// (flutter_map's built-in cache), shows the attribution, and never
/// downloads areas for offline use. A fork that ships the app must change
/// the app id and read the policy.
class MapConfig {
  MapConfig._();

  /// Switch providers here (or with --dart-define=MAP_TILE_URL=...).
  static const String tileUrl = String.fromEnvironment(
    'MAP_TILE_URL',
    defaultValue: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  );

  /// Sent as the tile requests' User-Agent: the app's real id. OSM blocks
  /// the default "unknown" and every com.example.* id.
  static const String userAgentPackageName = 'com.diladev.parkeasy';

  static const String attribution = '© OpenStreetMap contributors';
  static final Uri attributionUrl = Uri.parse(
    'https://www.openstreetmap.org/copyright',
  );

  /// Central Sulaymaniyah, until the phone's location is known.
  static const double defaultLatitude = DefaultLocation.latitude;
  static const double defaultLongitude = DefaultLocation.longitude;
  static const double defaultZoom = 13.5;
  static const double userZoom = 15;

  /// OSM has tiles up to 19; past that the map scales them up.
  static const int maxNativeZoom = 19;
  static const double maxZoom = 20;
  static const double minZoom = 4;
}
