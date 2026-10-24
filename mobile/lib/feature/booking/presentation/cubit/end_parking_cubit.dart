import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/usecases/end_booking.dart';

enum EndParkingStatus { idle, ending, ended }

class EndParkingState extends Equatable {
  const EndParkingState({
    this.status = EndParkingStatus.idle,
    this.booking,
    this.errorMessage,
    this.errorSerial = 0,
  });

  final EndParkingStatus status;

  /// The finished booking, once ended.
  final Booking? booking;
  final String? errorMessage;
  final int errorSerial;

  @override
  List<Object?> get props => [status, booking, errorMessage, errorSerial];
}

/// The "End parking now?" sheet.
class EndParkingCubit extends Cubit<EndParkingState> {
  EndParkingCubit(this._endBooking) : super(const EndParkingState());

  final EndBooking _endBooking;

  Future<void> end(Booking booking) async {
    if (state.status != EndParkingStatus.idle) return;
    emit(EndParkingState(
      status: EndParkingStatus.ending,
      errorSerial: state.errorSerial,
    ));

    final result = await _endBooking(booking.id);
    result.fold(
      (failure) => emit(
        EndParkingState(
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (ended) => emit(
        EndParkingState(
          status: EndParkingStatus.ended,
          booking: ended,
          errorSerial: state.errorSerial,
        ),
      ),
    );
  }
}
