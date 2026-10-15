import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/cancellation.dart';
import 'package:mobile/feature/booking/domain/usecases/cancel_booking.dart';

enum CancelStatus { idle, cancelling, cancelled }

class CancelBookingState extends Equatable {
  const CancelBookingState({
    this.status = CancelStatus.idle,
    this.cancellation,
    this.errorMessage,
    this.errorSerial = 0,
  });

  final CancelStatus status;

  /// Set once cancelled.
  final Cancellation? cancellation;
  final String? errorMessage;
  final int errorSerial;

  @override
  List<Object?> get props => [status, cancellation, errorMessage, errorSerial];
}

/// The "Cancel booking?" sheet.
class CancelBookingCubit extends Cubit<CancelBookingState> {
  CancelBookingCubit(this._cancelBooking) : super(const CancelBookingState());

  final CancelBooking _cancelBooking;

  Future<void> cancel(Booking booking) async {
    if (state.status != CancelStatus.idle) return;
    emit(CancelBookingState(
      status: CancelStatus.cancelling,
      errorSerial: state.errorSerial,
    ));

    final result = await _cancelBooking(booking.id);
    result.fold(
      (failure) => emit(
        CancelBookingState(
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (refund) => emit(
        CancelBookingState(
          status: CancelStatus.cancelled,
          cancellation: Cancellation(
            booking: booking,
            refund: refund,
            cancelledAt: DateTime.now(),
          ),
          errorSerial: state.errorSerial,
        ),
      ),
    );
  }
}
