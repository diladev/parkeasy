import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';

abstract class BookingRepository {
  /// Books [slotId] from now for [durationHours], paid from the wallet.
  ResultFuture<Booking> createBooking({
    required int lotId,
    required int slotId,
    required int vehicleId,
    required int durationHours,
  });

  ResultFuture<double> getWalletBalance();
}
