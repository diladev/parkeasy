import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_slot.dart';

class ParkingSlotModel extends ParkingSlot {
  const ParkingSlotModel({
    required super.id,
    required super.slotNumber,
    required super.level,
    required super.status,
  });

  factory ParkingSlotModel.fromMap(DataMap map) {
    return ParkingSlotModel(
      id: (map['id'] as num).toInt(),
      slotNumber: map['slot_number'] as String,
      level: map['level'] as String,
      status: SlotStatus.fromApi(map['status'] as String?),
    );
  }
}
