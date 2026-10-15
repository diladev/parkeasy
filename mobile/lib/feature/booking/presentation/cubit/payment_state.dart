import 'package:equatable/equatable.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

enum PaymentStatus { loading, ready, failure, paying, paid }

class PaymentState extends Equatable {
  const PaymentState({
    required this.draft,
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
  final PaymentStatus status;
  final int durationHours;

  /// The wallet balance.
  final double balance;
  final List<Vehicle> vehicles;

  /// The vehicle being booked for.
  final Vehicle? vehicle;

  /// The new booking, once paid.
  final Booking? booking;

  /// Why loading or paying failed.
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  double get total => draft.pricePerHour * durationHours;
  bool get canAfford => balance + 0.001 >= total;

  PaymentState copyWith({
    PaymentStatus? status,
    int? durationHours,
    double? balance,
    List<Vehicle>? vehicles,
    Vehicle? vehicle,
    Booking? booking,
    String? errorMessage,
    int? errorSerial,
  }) {
    return PaymentState(
      draft: draft,
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
