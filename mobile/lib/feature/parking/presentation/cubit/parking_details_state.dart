import 'package:equatable/equatable.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/entities/parking_slot.dart';

enum ParkingDetailsStatus { loading, loaded, failure }

class ParkingDetailsState extends Equatable {
  const ParkingDetailsState({
    this.status = ParkingDetailsStatus.loading,
    this.lot,
    this.level,
    this.selectedSlot,
    this.errorMessage,
  });

  final ParkingDetailsStatus status;
  final ParkingLotDetails? lot;

  /// The level whose slots are shown.
  final String? level;

  final ParkingSlot? selectedSlot;

  /// Why the lot couldn't be loaded.
  final String? errorMessage;

  /// The slots of the level being shown.
  List<ParkingSlot> get levelSlots =>
      lot?.slots.where((slot) => slot.level == level).toList() ?? const [];

  @override
  List<Object?> get props => [status, lot, level, selectedSlot, errorMessage];
}
