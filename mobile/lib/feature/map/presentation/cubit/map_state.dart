import 'package:equatable/equatable.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

enum MapStatus { loading, loaded, failure }

/// A lot on the map, with its straight-line distance from the user (null
/// while the user's location isn't known).
class MapLot extends Equatable {
  const MapLot({required this.lot, this.distanceKm});

  final ParkingLotSummary lot;
  final double? distanceKm;

  GeoPoint get point => GeoPoint(lot.latitude, lot.longitude);

  @override
  List<Object?> get props => [lot, distanceKm];
}

class MapState extends Equatable {
  const MapState({
    this.status = MapStatus.loading,
    this.lots = const [],
    this.userLocation,
    this.selectedLotId,
    this.errorMessage,
  });

  final MapStatus status;

  /// Nearest first when the user's location is known, otherwise the ones
  /// with the most free slots first.
  final List<MapLot> lots;
  final GeoPoint? userLocation;
  final int? selectedLotId;
  final String? errorMessage;

  MapLot? get selected {
    for (final lot in lots) {
      if (lot.lot.id == selectedLotId) return lot;
    }
    return null;
  }

  @override
  List<Object?> get props => [
    status,
    lots,
    userLocation,
    selectedLotId,
    errorMessage,
  ];
}

/// Puts [lots] in order: by distance from [user], or by free slots without.
List<MapLot> orderLots(List<ParkingLotSummary> lots, GeoPoint? user) {
  final ordered = [
    for (final lot in lots)
      MapLot(
        lot: lot,
        distanceKm: user?.distanceKmTo(GeoPoint(lot.latitude, lot.longitude)),
      ),
  ];
  ordered.sort((a, b) {
    final byDistance = (a.distanceKm ?? 0).compareTo(b.distanceKm ?? 0);
    if (user != null && byDistance != 0) return byDistance;
    final byFree = b.lot.availableSlots.compareTo(a.lot.availableSlots);
    return byFree != 0 ? byFree : a.lot.name.compareTo(b.lot.name);
  });
  return ordered;
}
