import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/booking_page.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

abstract class BookingRepository {
  /// Books [slotId] from now for [durationHours], paid from the wallet.
  ResultFuture<Booking> createBooking({
    required int lotId,
    required int slotId,
    required int vehicleId,
    required int durationHours,
  });

  ResultFuture<double> getWalletBalance();

  /// The user's bookings, newest first; all of them when [status] is null.
  ResultFuture<BookingPage> getBookings({BookingStatus? status, int page = 1});

  ResultFuture<Booking> getBooking(int bookingId);
}
