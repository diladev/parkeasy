import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

class ParkingLotSummaryModel extends ParkingLotSummary {
  const ParkingLotSummaryModel({
    required super.id,
    required super.name,
    required super.address,
    required super.latitude,
    required super.longitude,
    required super.pricePerHour,
    required super.availableSlots,
    required super.totalSlots,
    required super.hasCctv,
    required super.hasEvCharging,
    required super.isCovered,
    required super.isAccessible,
  });

  /// One lot of GET /parking/search or /parking/nearby.
  factory ParkingLotSummaryModel.fromMap(DataMap map) {
    double number(String key) => (map[key] as num? ?? 0).toDouble();

    // MariaDB stores booleans as TINYINT, so accept 1/0 as well as true/false.
    bool flag(String key) => switch (map[key]) {
      final bool value => value,
      final num value => value != 0,
      _ => false,
    };

    return ParkingLotSummaryModel(
      id: (map['id'] as num).toInt(),
      name: map['name'] as String,
      address: map['address'] as String? ?? '',
      latitude: number('latitude'),
      longitude: number('longitude'),
      pricePerHour: number('price_per_hour'),
      availableSlots: number('available_slots').toInt(),
      totalSlots: number('total_slots').toInt(),
      hasCctv: flag('has_cctv'),
      hasEvCharging: flag('has_ev_charging'),
      isCovered: flag('is_covered'),
      isAccessible: flag('is_accessible'),
    );
  }
}
