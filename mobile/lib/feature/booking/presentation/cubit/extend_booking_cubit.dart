import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/pricing/price_rules.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/usecases/extend_booking.dart';
import 'package:mobile/feature/booking/domain/usecases/get_wallet_balance.dart';

enum ExtendStatus { loading, ready, failure, saving, saved }

class ExtendBookingState extends Equatable {
  const ExtendBookingState({
    required this.booking,
    this.status = ExtendStatus.loading,
    this.extraHours = 1,
    this.balance = 0,
    this.errorMessage,
    this.errorSerial = 0,
  });

  final Booking booking;
  final ExtendStatus status;
  final int extraHours;
  final int balance;
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  /// The API's limit for one booking, extensions included.
  static const int maxTotalHours = 24;

  DateTime get newEndTime => booking.endTime.add(Duration(hours: extraHours));

  /// Charged by the rules the booking was made with: hours on a day already
  /// at its daily cap add nothing (the server works it out the same way).
  int get extraCost => booking.rules.extensionCost(
    booking.startTime,
    booking.endTime,
    newEndTime,
  );

  /// What the daily cap takes off the extra hours.
  int get capSaving {
    final full = booking.rules.uncappedCost(booking.endTime, extraHours);
    return full > extraCost ? full - extraCost : 0;
  }

  /// Special prices (Eid, Newroz...) the extra hours fall on.
  List<DayPrice> get specialPrices =>
      booking.rules.priceStay(booking.endTime, newEndTime).specialPrices;
  bool get canAfford => balance >= extraCost;

  /// Whether [hours] more still fits in the longest allowed booking.
  bool allows(int hours) => booking.durationHours + hours <= maxTotalHours;

  ExtendBookingState copyWith({
    Booking? booking,
    ExtendStatus? status,
    int? extraHours,
    int? balance,
    String? errorMessage,
    int? errorSerial,
  }) {
    return ExtendBookingState(
      booking: booking ?? this.booking,
      status: status ?? this.status,
      extraHours: extraHours ?? this.extraHours,
      balance: balance ?? this.balance,
      errorMessage: errorMessage ?? this.errorMessage,
      errorSerial: errorSerial ?? this.errorSerial,
    );
  }

  @override
  List<Object?> get props => [
    booking,
    status,
    extraHours,
    balance,
    errorMessage,
    errorSerial,
  ];
}

/// The Extend parking screen: how many hours to add, paid from the wallet.
class ExtendBookingCubit extends Cubit<ExtendBookingState> {
  ExtendBookingCubit(
    this._getWalletBalance,
    this._extendBooking, {
    required Booking booking,
  }) : super(ExtendBookingState(booking: booking));

  final GetWalletBalance _getWalletBalance;
  final ExtendBooking _extendBooking;

  Future<void> load() async {
    emit(state.copyWith(status: ExtendStatus.loading));
    final result = await _getWalletBalance();
    result.fold(
      (failure) => emit(
        state.copyWith(
          status: ExtendStatus.failure,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (balance) =>
          emit(state.copyWith(status: ExtendStatus.ready, balance: balance)),
    );
  }

  void selectHours(int hours) {
    if (state.allows(hours)) emit(state.copyWith(extraHours: hours));
  }

  Future<void> extend() async {
    if (state.status != ExtendStatus.ready) return;
    emit(state.copyWith(status: ExtendStatus.saving));

    final result = await _extendBooking(
      ExtendBookingParams(
        bookingId: state.booking.id,
        extraHours: state.extraHours,
      ),
    );
    result.fold(
      (failure) => emit(
        state.copyWith(
          status: ExtendStatus.ready,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (booking) => emit(
        state.copyWith(status: ExtendStatus.saved, booking: booking),
      ),
    );
  }
}
