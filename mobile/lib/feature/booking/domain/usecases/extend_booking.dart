import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

class ExtendBooking extends UsecaseWithParams<Booking, ExtendBookingParams> {
  const ExtendBooking(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<Booking> call(ExtendBookingParams params) =>
      _repository.extendBooking(
        bookingId: params.bookingId,
        extraHours: params.extraHours,
      );
}

class ExtendBookingParams extends Equatable {
  const ExtendBookingParams({
    required this.bookingId,
    required this.extraHours,
  });

  final int bookingId;
  final int extraHours;

  @override
  List<Object?> get props => [bookingId, extraHours];
}
