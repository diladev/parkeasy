import 'package:mobile/feature/directions/domain/entities/map_app.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';

/// The phone the links are for. iOS 18.4 changed Apple Maps' link format.
class DirectionsPlatform {
  const DirectionsPlatform.android() : isIos = false, iosVersion = null;
  const DirectionsPlatform.ios(this.iosVersion) : isIos = true;

  final bool isIos;

  /// (major, minor), e.g. (18, 4); null if it couldn't be read.
  final (int, int)? iosVersion;

  bool get hasNewAppleMapsLinks {
    final version = iosVersion;
    if (version == null) return true; // assume a current iPhone
    final (major, minor) = version;
    return major > 18 || (major == 18 && minor >= 4);
  }
}

/// The links that open each map app, in the order to try them. Every link
/// is a documented consumer URL that needs no API key. Pure: no plugin
/// calls, so it's fully unit-tested.
///
/// Coordinates are always latitude,longitude here (unlike GeoJSON/OSRM).
class DirectionsUrlBuilder {
  const DirectionsUrlBuilder(this.platform);

  final DirectionsPlatform platform;

  List<Uri> candidates(MapApp app, GeoPoint destination, String label) {
    final latLng = '${destination.latitude},${destination.longitude}';

    switch (app) {
      case MapApp.google:
        final web = Uri.parse(
          'https://www.google.com/maps/dir/?api=1'
          '&destination=$latLng&travelmode=driving',
        );
        return [
          // The app first on iOS; the https link opens the app or the browser.
          if (platform.isIos)
            Uri.parse('comgooglemaps://?daddr=$latLng&directionsmode=driving'),
          web,
          // Android without a browser: any installed map app.
          if (!platform.isIos) _geo(latLng, label),
        ];
      case MapApp.apple:
        return [
          platform.hasNewAppleMapsLinks
              ? Uri.parse(
                  'https://maps.apple.com/directions'
                  '?destination=$latLng&mode=driving',
                )
              : Uri.parse('https://maps.apple.com/?daddr=$latLng&dirflg=d'),
        ];
      case MapApp.waze:
        return [Uri.parse('https://waze.com/ul?ll=$latLng&navigate=yes')];
    }
  }

  /// geo:0,0?q=LAT,LNG(Label): Android's "open with" chooser.
  Uri _geo(String latLng, String label) =>
      Uri.parse('geo:0,0?q=$latLng(${Uri.encodeComponent(label)})');
}
