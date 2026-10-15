import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/usecases/get_booking.dart';

enum BookingDetailStatus { loading, loaded, failure }

class BookingDetailState extends Equatable {
  const BookingDetailState({
    this.status = BookingDetailStatus.loading,
    this.booking,
    this.errorMessage,
  });

  final BookingDetailStatus status;
  final Booking? booking;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, booking, errorMessage];
}

/// One booking, loaded fresh so its status is current.
class BookingDetailCubit extends Cubit<BookingDetailState> {
  BookingDetailCubit(this._getBooking) : super(const BookingDetailState());

  final GetBooking _getBooking;

  Future<void> load(int bookingId) async {
    // Keep showing the booking while it refreshes.
    if (state.booking == null) emit(const BookingDetailState());

    final result = await _getBooking(bookingId);
    result.fold(
      (failure) => emit(
        BookingDetailState(
          status: state.booking == null
              ? BookingDetailStatus.failure
              : BookingDetailStatus.loaded,
          booking: state.booking,
          errorMessage: failure.message,
        ),
      ),
      (booking) => emit(
        BookingDetailState(
          status: BookingDetailStatus.loaded,
          booking: booking,
        ),
      ),
    );
  }
}
