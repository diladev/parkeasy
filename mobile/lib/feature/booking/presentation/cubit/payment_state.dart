import 'package:equatable/equatable.dart';
import 'package:mobile/core/pricing/price_rules.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

enum PaymentStatus { loading, ready, failure, paying, paid }

class PaymentState extends Equatable {
  const PaymentState({
    required this.draft,
    required this.startsAt,
    this.status = PaymentStatus.loading,
    this.durationHours = 1,
    this.balance = 0,
    this.vehicles = const [],
    this.vehicle,
    this.booking,
    this.errorMessage,
    this.errorSerial = 0,
  });

  final BookingDraft draft;

  /// When the booking would start: now, as of the last change. The price
  /// depends on it (special prices and caps go by the day).
  final DateTime startsAt;
  final PaymentStatus status;
  final int durationHours;

  /// The wallet balance.
  final int balance;
  final List<Vehicle> vehicles;

  /// The vehicle being booked for.
  final Vehicle? vehicle;

  /// The new booking, once paid.
  final Booking? booking;

  /// Why loading or paying failed.
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  /// What the chosen hours cost, by the lot's rules (daily cap, special prices).
  PriceQuote get quote => draft.rules.priceStay(
    startsAt,
    startsAt.add(Duration(hours: durationHours)),
  );

  int get total => quote.amount;
  bool get canAfford => balance >= total;

  PaymentState copyWith({
    DateTime? startsAt,
    PaymentStatus? status,
    int? durationHours,
    int? balance,
    List<Vehicle>? vehicles,
    Vehicle? vehicle,
    Booking? booking,
    String? errorMessage,
    int? errorSerial,
  }) {
    return PaymentState(
      draft: draft,
      startsAt: startsAt ?? this.startsAt,
      status: status ?? this.status,
      durationHours: durationHours ?? this.durationHours,
      balance: balance ?? this.balance,
      vehicles: vehicles ?? this.vehicles,
      vehicle: vehicle ?? this.vehicle,
      booking: booking ?? this.booking,
      errorMessage: errorMessage ?? this.errorMessage,
      errorSerial: errorSerial ?? this.errorSerial,
    );
  }

  @override
  List<Object?> get props => [
    draft,
    startsAt,
    status,
    durationHours,
    balance,
    vehicles,
    vehicle,
    booking,
    errorMessage,
    errorSerial,
  ];
}
