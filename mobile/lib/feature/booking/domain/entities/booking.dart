import 'package:equatable/equatable.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// A booking with everything the confirmation and detail screens show.
class Booking extends Equatable {
  const Booking({
    required this.id,
    required this.status,
    required this.lotName,
    required this.slotNumber,
    required this.level,
    required this.vehicleName,
    required this.plateNumber,
    required this.startTime,
    required this.endTime,
    required this.durationHours,
    required this.totalCost,
  });

  final int id;
  final BookingStatus status;
  final String lotName;
  final String slotNumber;
  final String level;

  /// "Toyota Camry"
  final String vehicleName;
  final String plateNumber;
  final DateTime startTime;
  final DateTime endTime;
  final int durationHours;
  final double totalCost;

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
    lotName,
    slotNumber,
    level,
    vehicleName,
    plateNumber,
    startTime,
    endTime,
    durationHours,
    totalCost,
  ];
}
