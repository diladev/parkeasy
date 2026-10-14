import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

class BookingSummaryModel extends BookingSummary {
  const BookingSummaryModel({
    required super.id,
    required super.status,
    required super.lotId,
    required super.lotName,
    required super.slotNumber,
    required super.startTime,
    required super.endTime,
  });

  /// One item of GET /booking (the lot and slot are included).
  factory BookingSummaryModel.fromMap(DataMap map) {
    final lot = map['parking_lot'] as DataMap?;
    final slot = map['parking_slot'] as DataMap?;
    return BookingSummaryModel(
      id: (map['id'] as num).toInt(),
      status: BookingStatus.fromApi(map['status'] as String?),
      lotId: (map['parking_lot_id'] as num).toInt(),
      lotName: lot?['name'] as String? ?? 'Parking lot',
      slotNumber: slot?['slot_number'] as String? ?? '',
      // The API sends UTC; the app shows local time.
      startTime: DateTime.parse(map['start_time'] as String).toLocal(),
      endTime: DateTime.parse(map['end_time'] as String).toLocal(),
    );
  }
}
