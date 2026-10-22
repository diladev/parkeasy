import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

class GetBookingReceipt extends UsecaseWithParams<BookingReceipt, int> {
  const GetBookingReceipt(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<BookingReceipt> call(int bookingId) =>
      _repository.getReceipt(bookingId);
}
