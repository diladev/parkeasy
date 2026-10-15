import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

class GetBooking extends UsecaseWithParams<Booking, int> {
  const GetBooking(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<Booking> call(int bookingId) =>
      _repository.getBooking(bookingId);
}
