import 'package:equatable/equatable.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// A booking with everything the booking screens show.
class Booking extends Equatable {
  const Booking({
    required this.id,
    required this.status,
    required this.lotId,
    required this.lotName,
    required this.lotAddress,
    required this.slotNumber,
    required this.level,
    required this.vehicleName,
    required this.plateNumber,
    required this.startTime,
    required this.endTime,
    required this.durationHours,
    required this.pricePerHour,
    required this.totalCost,
  });

  final int id;
  final BookingStatus status;
  final int lotId;
  final String lotName;
  final String lotAddress;
  final String slotNumber;
  final String level;

  /// "Toyota Camry"
  final String vehicleName;
  final String plateNumber;
  final DateTime startTime;
  final DateTime endTime;
  final int durationHours;

  /// The lot's price when the booking was made.
  final double pricePerHour;
  final double totalCost;

  bool get isActive => status == BookingStatus.active;

  /// "A04 · Level B1"
  String get slotLabel => '$slotNumber · Level $level';

  /// "Toyota Camry · ABC 1234"
  String get vehicleLabel => [
    vehicleName,
    plateNumber,
  ].where((part) => part.isNotEmpty).join(' · ');

  @override
  List<Object?> get props => [
    id,
    status,
    lotId,
    lotName,
    lotAddress,
    slotNumber,
    level,
    vehicleName,
    plateNumber,
    startTime,
    endTime,
    durationHours,
    pricePerHour,
    totalCost,
  ];
}
