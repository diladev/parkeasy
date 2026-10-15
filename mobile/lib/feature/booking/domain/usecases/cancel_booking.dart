import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

/// Cancels a booking; returns the amount refunded to the wallet.
class CancelBooking extends UsecaseWithParams<double, int> {
  const CancelBooking(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<double> call(int bookingId) =>
      _repository.cancelBooking(bookingId);
}
