import 'package:equatable/equatable.dart';

/// A lot in the search results: enough to choose one, not its slots.
class ParkingLotSummary extends Equatable {
  const ParkingLotSummary({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.pricePerHour,
    required this.availableSlots,
    required this.totalSlots,
    required this.hasCctv,
    required this.hasEvCharging,
    required this.isCovered,
    required this.isAccessible,
    required this.rating,
    required this.isOpen24h,
  });

  final int id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final int pricePerHour;
  final int availableSlots;
  final int totalSlots;
  final bool hasCctv;
  final bool hasEvCharging;
  final bool isCovered;
  final bool isAccessible;

  /// 0 to 5; 0 for a lot with no ratings yet.
  final double rating;
  final bool isOpen24h;

  /// The lot's features as short labels, most useful first.
  List<String> get featureLabels => [
    if (isCovered) 'Covered',
    if (hasEvCharging) 'EV',
    if (isAccessible) 'Accessible',
    if (hasCctv) 'CCTV',
  ];

  @override
  List<Object?> get props => [
    id,
    name,
    address,
    latitude,
    longitude,
    pricePerHour,
    availableSlots,
    totalSlots,
    hasCctv,
    hasEvCharging,
    isCovered,
    isAccessible,
    rating,
    isOpen24h,
  ];
}
