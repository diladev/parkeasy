import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';
import 'package:mobile/feature/booking/domain/usecases/get_booking_receipt.dart';

enum BookingReceiptStatus { loading, loaded, failure }

class BookingReceiptState extends Equatable {
  const BookingReceiptState({
    this.status = BookingReceiptStatus.loading,
    this.receipt,
    this.errorMessage,
  });

  final BookingReceiptStatus status;
  final BookingReceipt? receipt;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, receipt, errorMessage];
}

/// A booking's receipt, loaded from the server's records.
class BookingReceiptCubit extends Cubit<BookingReceiptState> {
  BookingReceiptCubit(this._getReceipt) : super(const BookingReceiptState());

  final GetBookingReceipt _getReceipt;

  Future<void> load(int bookingId) async {
    emit(const BookingReceiptState());

    final result = await _getReceipt(bookingId);
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        BookingReceiptState(
          status: BookingReceiptStatus.failure,
          errorMessage: failure.message,
        ),
      ),
      (receipt) => emit(
        BookingReceiptState(
          status: BookingReceiptStatus.loaded,
          receipt: receipt,
        ),
      ),
    );
  }
}
