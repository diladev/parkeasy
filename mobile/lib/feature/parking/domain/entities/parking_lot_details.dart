import 'package:equatable/equatable.dart';
import 'package:mobile/feature/parking/domain/entities/parking_slot.dart';

/// Everything the lot details screen shows: the lot, its features and its slots.
class ParkingLotDetails extends Equatable {
  const ParkingLotDetails({
    required this.id,
    required this.name,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.pricePerHour,
    required this.rating,
    required this.isOpen24h,
    required this.openingTime,
    required this.closingTime,
    required this.hasCctv,
    required this.hasEvCharging,
    required this.isCovered,
    required this.isAccessible,
    required this.availableSlots,
    this.isFavorite = false,
    required this.totalSlots,
    required this.slots,
  });

  final int id;
  final String name;
  final String address;
  final double latitude;
  final double longitude;
  final int pricePerHour;
  final double rating;
  final bool isOpen24h;

  /// "HH:mm", local time.
  final String openingTime;
  final String closingTime;

  final bool hasCctv;
  final bool hasEvCharging;
  final bool isCovered;
  final bool isAccessible;
  final int availableSlots;

  /// The user saved it with the heart.
  final bool isFavorite;
  final int totalSlots;

  /// Sorted by level, then slot number.
  final List<ParkingSlot> slots;

  /// The lot's levels, in the order the API sorted the slots.
  List<String> get levels => slots.map((slot) => slot.level).toSet().toList();

  @override
  List<Object?> get props => [
    id,
    name,
    address,
    latitude,
    longitude,
    pricePerHour,
    rating,
    isOpen24h,
    openingTime,
    closingTime,
    hasCctv,
    hasEvCharging,
    isCovered,
    isAccessible,
    availableSlots,
    isFavorite,
    totalSlots,
    slots,
  ];
}
