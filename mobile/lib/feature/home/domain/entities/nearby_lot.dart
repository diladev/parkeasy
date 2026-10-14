import 'package:equatable/equatable.dart';

/// A parking lot near the user, with its live slot counts.
class NearbyLot extends Equatable {
  const NearbyLot({
    required this.id,
    required this.name,
    required this.address,
    required this.availableSlots,
    required this.totalSlots,
    required this.distanceKm,
  });

  final int id;
  final String name;
  final String address;
  final int availableSlots;
  final int totalSlots;
  final double distanceKm;

  @override
  List<Object?> get props => [
    id,
    name,
    address,
    availableSlots,
    totalSlots,
    distanceKm,
  ];
}
