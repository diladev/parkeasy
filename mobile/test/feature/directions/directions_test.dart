import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/feature/directions/data/directions_repository_implementation.dart';
import 'package:mobile/feature/directions/data/directions_url_builder.dart';
import 'package:mobile/feature/directions/domain/entities/map_app.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';

const lot = GeoPoint(35.5571, 45.4356);

List<String> links(DirectionsPlatform platform, MapApp app) => [
  for (final uri in DirectionsUrlBuilder(
    platform,
  ).candidates(app, lot, 'City Center Parking'))
    uri.toString(),
];

void main() {
  group('DirectionsUrlBuilder', () {
    test('Google Maps on Android: the web link, then any map app', () {
      expect(links(const DirectionsPlatform.android(), MapApp.google), [
        'https://www.google.com/maps/dir/?api=1'
            '&destination=35.5571,45.4356&travelmode=driving',
        'geo:0,0?q=35.5571,45.4356(City%20Center%20Parking)',
      ]);
    });

    test('Google Maps on iOS: the app first, then the web link', () {
      final ios = links(const DirectionsPlatform.ios((26, 0)), MapApp.google);

      expect(ios.first, 'comgooglemaps://?daddr=35.5571,45.4356&directionsmode=driving');
      expect(ios.last, startsWith('https://www.google.com/maps/dir/?api=1'));
    });

    test('Apple Maps uses the new links from iOS 18.4', () {
      expect(links(const DirectionsPlatform.ios((18, 4)), MapApp.apple), [
        'https://maps.apple.com/directions'
            '?destination=35.5571,45.4356&mode=driving',
      ]);
      expect(links(const DirectionsPlatform.ios((18, 3)), MapApp.apple), [
        'https://maps.apple.com/?daddr=35.5571,45.4356&dirflg=d',
      ]);
    });

    test('Waze', () {
      expect(links(const DirectionsPlatform.android(), MapApp.waze), [
        'https://waze.com/ul?ll=35.5571,45.4356&navigate=yes',
      ]);
    });

    test('latitude always comes first', () {
      for (final app in MapApp.values) {
        for (final link in links(const DirectionsPlatform.ios((26, 0)), app)) {
          expect(link, contains('35.5571,45.4356'));
        }
      }
    });
  });

  group('DirectionsRepositoryImpl', () {
    test('stops at the first link that opens', () async {
      final tried = <Uri>[];
      final repository = DirectionsRepositoryImpl(
        platform: const DirectionsPlatform.android(),
        open: (uri) async {
          tried.add(uri);
          return true;
        },
      );

      final result = await repository.openDirections(MapApp.google, lot, 'X');

      expect(result.isRight(), isTrue);
      expect(tried, hasLength(1));
    });

    test('moves on after a false or an error, and fails when none open', () async {
      final tried = <Uri>[];
      var calls = 0;
      final repository = DirectionsRepositoryImpl(
        platform: const DirectionsPlatform.android(),
        open: (uri) async {
          tried.add(uri);
          if (calls++ == 0) throw Exception('no browser');
          return false;
        },
      );

      final result = await repository.openDirections(MapApp.google, lot, 'X');

      expect(result.isLeft(), isTrue);
      expect(tried.map((uri) => uri.scheme), ['https', 'geo']);
    });

    test('offers Apple Maps on iOS only', () {
      expect(
        DirectionsRepositoryImpl(
          platform: const DirectionsPlatform.android(),
        ).availableApps,
        [MapApp.google, MapApp.waze],
      );
      expect(
        DirectionsRepositoryImpl(
          platform: const DirectionsPlatform.ios((26, 0)),
        ).availableApps,
        [MapApp.google, MapApp.apple, MapApp.waze],
      );
    });
  });
}
