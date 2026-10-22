import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/data/repositories/booking_remote_data_source.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/booking_page.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

class BookingRepositoryImpl implements BookingRepository {
  BookingRepositoryImpl(this._remoteDataSource);

  final BookingRemoteDataSource _remoteDataSource;

  @override
  ResultFuture<Booking> createBooking({
    required int lotId,
    required int slotId,
    required int vehicleId,
    required int durationHours,
  }) {
    return _guard(
      () => _remoteDataSource.createBooking(
        lotId: lotId,
        slotId: slotId,
        vehicleId: vehicleId,
        durationHours: durationHours,
      ),
    );
  }

  @override
  ResultFuture<int> getWalletBalance() {
    return _guard(_remoteDataSource.getWalletBalance);
  }

  @override
  ResultFuture<BookingPage> getBookings({BookingStatus? status, int page = 1}) {
    return _guard(
      () => _remoteDataSource.getBookings(status: status, page: page),
    );
  }

  @override
  ResultFuture<Booking> getBooking(int bookingId) {
    return _guard(() => _remoteDataSource.getBooking(bookingId));
  }

  @override
  ResultFuture<Booking> extendBooking({
    required int bookingId,
    required int extraHours,
  }) {
    return _guard(
      () => _remoteDataSource.extendBooking(
        bookingId: bookingId,
        extraHours: extraHours,
      ),
    );
  }

  @override
  ResultFuture<int> cancelBooking(int bookingId) {
    return _guard(() => _remoteDataSource.cancelBooking(bookingId));
  }

  @override
  ResultFuture<BookingReceipt> getReceipt(int bookingId) {
    return _guard(() => _remoteDataSource.getReceipt(bookingId));
  }

  ResultFuture<T> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    } catch (_) {
      return const Left(
        APIFailure(
          message: 'Something went wrong. Please try again.',
          statusCode: 500,
        ),
      );
    }
  }
}
