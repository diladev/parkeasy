import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

class BookingModel extends Booking {
  const BookingModel({
    required super.id,
    required super.status,
    required super.lotId,
    required super.lotName,
    required super.lotAddress,
    required super.slotNumber,
    required super.level,
    required super.vehicleName,
    required super.plateNumber,
    required super.startTime,
    required super.endTime,
    required super.durationHours,
    required super.pricePerHour,
    required super.totalCost,
    required super.cancellableUntil,
    super.endedAt,
    super.isPaidFromWallet,
  });

  /// A booking from the API, with its lot, slot and vehicle included.
  factory BookingModel.fromMap(DataMap map) {
    final lot = map['parking_lot'] as DataMap?;
    final slot = map['parking_slot'] as DataMap?;
    final vehicle = map['vehicle'] as DataMap?;
    final vehicleName = [
      vehicle?['brand'] as String? ?? '',
      vehicle?['model'] as String? ?? '',
    ].where((part) => part.isNotEmpty).join(' ');

    // The API sends UTC; the app shows local time.
    DateTime? time(String key) =>
        map[key] == null ? null : DateTime.parse(map[key] as String).toLocal();
    final startTime = time('start_time')!;

    return BookingModel(
      id: (map['id'] as num).toInt(),
      status: BookingStatus.fromApi(map['status'] as String?),
      lotId: (map['parking_lot_id'] as num).toInt(),
      lotName: lot?['name'] as String? ?? 'Parking lot',
      lotAddress: lot?['address'] as String? ?? '',
      slotNumber: slot?['slot_number'] as String? ?? '',
      level: slot?['level'] as String? ?? '',
      vehicleName: vehicleName,
      plateNumber: vehicle?['license_plate'] as String? ?? '',
      startTime: startTime,
      endTime: time('end_time')!,
      durationHours: (map['duration_hours'] as num? ?? 0).toInt(),
      pricePerHour: (map['price_per_hour'] as num? ?? 0).round(),
      totalCost: (map['total_cost'] as num? ?? 0).round(),
      // Bookings from before the window was stored got the default one.
      cancellableUntil:
          time('cancellable_until') ??
          startTime.add(
            const Duration(minutes: Booking.defaultFreeCancellationMinutes),
          ),
      endedAt: time('ended_at'),
      isPaidFromWallet: map['payment_method'] != 'card',
    );
  }
}
