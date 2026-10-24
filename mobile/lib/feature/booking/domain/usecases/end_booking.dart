import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

/// Ends a booking now, frees its slot and refunds nothing; returns the
/// finished booking.
class EndBooking extends UsecaseWithParams<Booking, int> {
  const EndBooking(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<Booking> call(int bookingId) =>
      _repository.endBooking(bookingId);
}
