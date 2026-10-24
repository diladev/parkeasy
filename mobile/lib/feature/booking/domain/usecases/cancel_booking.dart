import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

/// Cancels a booking during its free cancellation window; returns the amount
/// refunded to the wallet.
class CancelBooking extends UsecaseWithParams<int, int> {
  const CancelBooking(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<int> call(int bookingId) =>
      _repository.cancelBooking(bookingId);
}
