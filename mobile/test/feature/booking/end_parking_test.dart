import 'dart:async';

import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/data/models/booking_model.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/booking_page.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';
import 'package:mobile/feature/booking/domain/usecases/end_booking.dart';
import 'package:mobile/feature/booking/presentation/cubit/end_parking_cubit.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

final start = DateTime(2026, 10, 24, 9, 15);
DateTime minutesIn(num minutes) =>
    start.add(Duration(seconds: (minutes * 60).round()));

/// 3 hours at 1,500 IQD at a lot with a 10-minute window.
Booking booking({
  BookingStatus status = BookingStatus.active,
  DateTime? endedAt,
  bool isPaidFromWallet = true,
}) => Booking(
  id: 6,
  status: status,
  lotId: 1,
  lotName: 'City Center Parking',
  lotAddress: 'Salim Street, Sulaymaniyah',
  slotNumber: 'A04',
  level: 'B1',
  vehicleName: 'Toyota Corolla',
  plateNumber: '22 SUL 48213',
  startTime: start,
  endTime: start.add(const Duration(hours: 3)),
  durationHours: 3,
  pricePerHour: 1500,
  totalCost: 4500,
  cancellableUntil: minutesIn(10),
  endedAt: endedAt,
  isPaidFromWallet: isPaidFromWallet,
);

/// PATCH /booking/:id/end answers with the finished booking; [failWith]
/// makes it fail, [pending] holds the answer back.
class FakeBookingRepository implements BookingRepository {
  String? failWith;
  Completer<void>? pending;
  int endCalls = 0;

  @override
  ResultFuture<Booking> endBooking(int bookingId) async {
    endCalls++;
    await pending?.future;
    final message = failWith;
    if (message != null) {
      return Left(APIFailure(message: message, statusCode: 409));
    }
    return Right(
      booking(status: BookingStatus.completed, endedAt: minutesIn(82)),
    );
  }

  @override
  ResultFuture<int> cancelBooking(int bookingId) => throw UnimplementedError();

  @override
  ResultFuture<Booking> createBooking({
    required int lotId,
    required int slotId,
    required int vehicleId,
    required int durationHours,
  }) => throw UnimplementedError();

  @override
  ResultFuture<Booking> extendBooking({
    required int bookingId,
    required int extraHours,
  }) => throw UnimplementedError();

  @override
  ResultFuture<Booking> getBooking(int bookingId) => throw UnimplementedError();

  @override
  ResultFuture<BookingPage> getBookings({
    BookingStatus? status,
    int page = 1,
  }) => throw UnimplementedError();

  @override
  ResultFuture<BookingReceipt> getReceipt(int bookingId) =>
      throw UnimplementedError();

  @override
  ResultFuture<int> getWalletBalance() => throw UnimplementedError();
}

void main() {
  group('free cancellation window', () {
    test('cancelling is possible up to and including its last moment', () {
      expect(booking().canCancelAt(start), isTrue);
      expect(booking().canCancelAt(minutesIn(9.5)), isTrue);
      expect(booking().canCancelAt(minutesIn(10)), isTrue);
    });

    test('after the window it can only be ended', () {
      expect(booking().canCancelAt(minutesIn(10.01)), isFalse);
      expect(booking().canCancelAt(minutesIn(82)), isFalse);
    });

    test('a booking that is over can never be cancelled', () {
      final cancelled = booking(status: BookingStatus.cancelled);
      expect(cancelled.canCancelAt(start), isFalse);
    });

    test('counts the minutes left, rounded up', () {
      expect(booking().freeCancellationMinutesLeft(start), 10);
      expect(booking().freeCancellationMinutesLeft(minutesIn(6)), 4);
      expect(booking().freeCancellationMinutesLeft(minutesIn(6.5)), 4);
      expect(booking().freeCancellationMinutesLeft(minutesIn(9.9)), 1);
      expect(booking().freeCancellationMinutesLeft(minutesIn(10)), 1);
      expect(booking().freeCancellationMinutesLeft(minutesIn(11)), 0);
    });

    test('cancelling refunds everything paid from the wallet', () {
      expect(booking().cancellationRefund, 4500);
      expect(booking(isPaidFromWallet: false).cancellationRefund, 0);
    });
  });

  group('ended early', () {
    test('finished when it was ended, not at the booked end', () {
      final ended = booking(
        status: BookingStatus.completed,
        endedAt: minutesIn(82),
      );
      expect(ended.endedEarly, isTrue);
      expect(ended.finishedAt, minutesIn(82));
    });

    test('a booking that ran its time finished at the booked end', () {
      final completed = booking(status: BookingStatus.completed);
      expect(completed.endedEarly, isFalse);
      expect(completed.finishedAt, start.add(const Duration(hours: 3)));
    });
  });

  group('BookingModel', () {
    DataMap json({Object? cancellableUntil, Object? endedAt}) => {
      'id': 6,
      'status': 'completed',
      'parking_lot_id': 1,
      'start_time': '2026-10-24T06:15:00.000Z',
      'end_time': '2026-10-24T09:15:00.000Z',
      'cancellable_until': cancellableUntil,
      'ended_at': endedAt,
      'duration_hours': 3,
      'price_per_hour': 1500,
      'total_cost': 4500,
      'payment_method': 'wallet',
    };

    test('reads the window and when it was ended', () {
      final model = BookingModel.fromMap(
        json(
          cancellableUntil: '2026-10-24T06:45:00.000Z',
          endedAt: '2026-10-24T07:37:00.000Z',
        ),
      );

      expect(
        model.cancellableUntil,
        DateTime.utc(2026, 10, 24, 6, 45).toLocal(),
      );
      expect(model.endedAt, DateTime.utc(2026, 10, 24, 7, 37).toLocal());
      expect(model.isPaidFromWallet, isTrue);
    });

    test('older bookings get the default 10-minute window', () {
      final model = BookingModel.fromMap(json());

      expect(
        model.cancellableUntil,
        DateTime.utc(2026, 10, 24, 6, 25).toLocal(),
      );
      expect(model.endedAt, isNull);
    });
  });

  group('EndParkingCubit', () {
    late FakeBookingRepository repository;
    late EndParkingCubit cubit;

    setUp(() {
      repository = FakeBookingRepository();
      cubit = EndParkingCubit(EndBooking(repository));
    });

    tearDown(() => cubit.close());

    test('ends the parking and keeps the finished booking', () async {
      await cubit.end(booking());

      expect(cubit.state.status, EndParkingStatus.ended);
      expect(cubit.state.booking?.status, BookingStatus.completed);
      expect(cubit.state.booking?.endedAt, minutesIn(82));
    });

    test("shows the server's reason when it can't be ended", () async {
      repository.failWith = 'This booking is no longer active.';

      await cubit.end(booking());

      expect(cubit.state.status, EndParkingStatus.idle);
      expect(cubit.state.errorMessage, 'This booking is no longer active.');
      expect(cubit.state.errorSerial, 1);
    });

    test('a second tap while ending sends nothing more', () async {
      repository.pending = Completer<void>();

      final first = cubit.end(booking());
      await cubit.end(booking());
      expect(cubit.state.status, EndParkingStatus.ending);

      repository.pending!.complete();
      await first;

      expect(repository.endCalls, 1);
      expect(cubit.state.status, EndParkingStatus.ended);
    });
  });
}
