import 'package:equatable/equatable.dart';
import 'package:mobile/core/pricing/price_rules.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// A booking with everything the booking screens show.
class Booking extends Equatable {
  const Booking({
    required this.id,
    required this.status,
    required this.lotId,
    required this.lotName,
    required this.lotAddress,
    required this.slotNumber,
    required this.level,
    required this.vehicleName,
    required this.plateNumber,
    required this.startTime,
    required this.endTime,
    required this.durationHours,
    required this.pricePerHour,
    this.priceRules,
    required this.totalCost,
    required this.cancellableUntil,
    this.endedAt,
    this.isPaidFromWallet = true,
  });

  final int id;
  final BookingStatus status;
  final int lotId;
  final String lotName;
  final String lotAddress;
  final String slotNumber;
  final String level;

  /// "Toyota Camry"
  final String vehicleName;
  final String plateNumber;
  final DateTime startTime;
  final DateTime endTime;
  final int durationHours;

  /// The lot's price when the booking was made.
  final int pricePerHour;

  /// Every price rule the booking keeps (hourly, daily cap, special prices),
  /// saved when it was made; null for older bookings.
  final PriceRules? priceRules;

  /// What an extension is charged by: the saved rules, or the plain hourly
  /// price for bookings made before rules were saved (the server does the same).
  PriceRules get rules => priceRules ?? PriceRules(pricePerHour: pricePerHour);
  final int totalCost;

  /// The end of the free cancellation window. Until then the booking can be
  /// cancelled with everything paid back; after it, only ended early, with
  /// nothing paid back. The server applies the same rule.
  final DateTime cancellableUntil;

  /// When the driver ended the parking early; null if they didn't.
  /// [endTime] stays the end they booked and paid for.
  final DateTime? endedAt;

  /// Paid from the ParkEasy Wallet, where refunds go. Only some older demo
  /// bookings were paid by card.
  final bool isPaidFromWallet;

  /// The lot's window when it doesn't set one, in minutes.
  static const int defaultFreeCancellationMinutes = 10;

  bool get isActive => status == BookingStatus.active;

  /// Whether it can still be cancelled at [now], for a full refund.
  bool canCancelAt(DateTime now) =>
      isActive && !now.isAfter(cancellableUntil);

  /// Whole minutes of free cancellation left at [now], rounded up: 1 for
  /// the last minute, 0 once it's over.
  int freeCancellationMinutesLeft(DateTime now) {
    if (!canCancelAt(now)) return 0;
    final seconds = cancellableUntil.difference(now).inSeconds;
    return seconds <= 0 ? 1 : (seconds / 60).ceil();
  }

  /// What cancelling now gives back: everything that came from the wallet.
  int get cancellationRefund => isPaidFromWallet ? totalCost : 0;

  bool get endedEarly => endedAt != null;

  /// When the parking actually finished: ended early, or the booked end.
  DateTime get finishedAt => endedAt ?? endTime;

  /// "A04 · Level B1"
  String get slotLabel => '$slotNumber · Level $level';

  /// "Toyota Camry · ABC 1234"
  String get vehicleLabel => [
    vehicleName,
    plateNumber,
  ].where((part) => part.isNotEmpty).join(' · ');

  @override
  List<Object?> get props => [
    id,
    status,
    lotId,
    lotName,
    lotAddress,
    slotNumber,
    level,
    vehicleName,
    plateNumber,
    startTime,
    endTime,
    durationHours,
    pricePerHour,
    priceRules,
    totalCost,
    cancellableUntil,
    endedAt,
    isPaidFromWallet,
  ];
}
