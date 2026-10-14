import 'package:equatable/equatable.dart';

enum SlotStatus {
  free,
  reserved,
  occupied;

  /// Anything the app doesn't know yet is treated as taken, so it can't be booked.
  static SlotStatus fromApi(String? value) => SlotStatus.values.firstWhere(
    (status) => status.name == value,
    orElse: () => SlotStatus.occupied,
  );
}

/// One parking space in a lot, e.g. A04 on level B1.
class ParkingSlot extends Equatable {
  const ParkingSlot({
    required this.id,
    required this.slotNumber,
    required this.level,
    required this.status,
  });

  final int id;
  final String slotNumber;
  final String level;
  final SlotStatus status;

  bool get isFree => status == SlotStatus.free;

  @override
  List<Object?> get props => [id, slotNumber, level, status];
}
