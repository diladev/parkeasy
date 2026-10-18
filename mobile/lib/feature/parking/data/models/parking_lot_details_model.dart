import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/data/models/parking_slot_model.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';

class ParkingLotDetailsModel extends ParkingLotDetails {
  const ParkingLotDetailsModel({
    required super.id,
    required super.name,
    required super.address,
    required super.latitude,
    required super.longitude,
    required super.pricePerHour,
    required super.rating,
    required super.isOpen24h,
    required super.openingTime,
    required super.closingTime,
    required super.hasCctv,
    required super.hasEvCharging,
    required super.isCovered,
    required super.isAccessible,
    required super.availableSlots,
    required super.totalSlots,
    required super.slots,
  });

  /// GET /parking/:id (the lot's columns, slot counts and its slots).
  factory ParkingLotDetailsModel.fromMap(DataMap map) {
    double number(String key) => (map[key] as num? ?? 0).toDouble();

    // MariaDB stores booleans as TINYINT, so accept 1/0 as well as true/false.
    bool flag(String key) => switch (map[key]) {
      final bool value => value,
      final num value => value != 0,
      _ => false,
    };

    return ParkingLotDetailsModel(
      id: (map['id'] as num).toInt(),
      name: map['name'] as String,
      address: map['address'] as String? ?? '',
      latitude: number('latitude'),
      longitude: number('longitude'),
      pricePerHour: number('price_per_hour').round(),
      rating: number('rating'),
      isOpen24h: flag('is_open_24h'),
      openingTime: map['opening_time'] as String? ?? '00:00',
      closingTime: map['closing_time'] as String? ?? '00:00',
      hasCctv: flag('has_cctv'),
      hasEvCharging: flag('has_ev_charging'),
      isCovered: flag('is_covered'),
      isAccessible: flag('is_accessible'),
      availableSlots: number('available_slots').toInt(),
      totalSlots: number('total_slots').toInt(),
      slots: (map['slots'] as List<dynamic>? ?? const [])
          .map((slot) => ParkingSlotModel.fromMap(slot as DataMap))
          .toList(),
    );
  }
}
