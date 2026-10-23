import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/map/presentation/cubit/map_state.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

ParkingLotSummary lot(String name, double lat, double lng, {int free = 5}) =>
    ParkingLotSummary(
      id: name.hashCode,
      name: name,
      address: '',
      latitude: lat,
      longitude: lng,
      pricePerHour: 1000,
      availableSlots: free,
      totalSlots: 10,
      hasCctv: false,
      hasEvCharging: false,
      isCovered: false,
      isAccessible: false,
      rating: 4,
      isOpen24h: false,
    );

void main() {
  group('GeoPoint.distanceKmTo', () {
    test('is 0 for the same place and the same both ways', () {
      const a = GeoPoint(35.5571, 45.4356);
      const b = GeoPoint(35.5794, 45.3992);

      expect(a.distanceKmTo(a), 0);
      expect(a.distanceKmTo(b), closeTo(b.distanceKmTo(a), 1e-9));
    });

    test('one degree of latitude is about 111 km', () {
      expect(
        const GeoPoint(35, 45).distanceKmTo(const GeoPoint(36, 45)),
        closeTo(111.2, 0.2),
      );
    });
  });

  group('orderLots', () {
    final lots = [
      lot('Far', 35.60, 45.40, free: 9),
      lot('Near', 35.558, 45.436, free: 1),
      lot('Middle', 35.57, 45.43, free: 4),
    ];

    test('with a location: nearest first, with distances', () {
      final ordered = orderLots(lots, const GeoPoint(35.5571, 45.4356));

      expect([for (final l in ordered) l.lot.name], ['Near', 'Middle', 'Far']);
      expect(ordered.first.distanceKm, lessThan(0.2));
    });

    test('without one: most free slots first, no distances', () {
      final ordered = orderLots(lots, null);

      expect([for (final l in ordered) l.lot.name], ['Far', 'Middle', 'Near']);
      expect(ordered.every((l) => l.distanceKm == null), isTrue);
    });
  });

  test('approxDistance rounds like a straight-line estimate', () {
    expect(Formatters.approxDistance(0.012), '≈ 50 m');
    expect(Formatters.approxDistance(0.34), '≈ 350 m');
    expect(Formatters.approxDistance(2.43), '≈ 2.4 km');
    expect(Formatters.approxDistance(12.6), '≈ 13 km');
  });
}
