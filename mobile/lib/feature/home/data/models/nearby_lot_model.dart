import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/domain/entities/nearby_lot.dart';

class NearbyLotModel extends NearbyLot {
  const NearbyLotModel({
    required super.id,
    required super.name,
    required super.address,
    required super.availableSlots,
    required super.totalSlots,
    required super.distanceKm,
  });

  /// One item of GET /parking/nearby.
  factory NearbyLotModel.fromMap(DataMap map) {
    return NearbyLotModel(
      id: (map['id'] as num).toInt(),
      name: map['name'] as String,
      address: map['address'] as String? ?? '',
      availableSlots: (map['available_slots'] as num? ?? 0).toInt(),
      totalSlots: (map['total_slots'] as num? ?? 0).toInt(),
      distanceKm: (map['distance_km'] as num? ?? 0).toDouble(),
    );
  }
}
