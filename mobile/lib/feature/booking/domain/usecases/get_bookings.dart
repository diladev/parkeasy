import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking_page.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

class GetBookings extends UsecaseWithParams<BookingPage, GetBookingsParams> {
  const GetBookings(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<BookingPage> call(GetBookingsParams params) =>
      _repository.getBookings(status: params.status, page: params.page);
}

class GetBookingsParams extends Equatable {
  const GetBookingsParams({this.status, this.page = 1});

  /// Null for every booking.
  final BookingStatus? status;
  final int page;

  @override
  List<Object?> get props => [status, page];
}
