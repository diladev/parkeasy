import 'package:equatable/equatable.dart';
import 'package:mobile/core/pricing/price_rules.dart';

/// What the user picked on the lot details screen, before paying.
class BookingDraft extends Equatable {
  const BookingDraft({
    required this.lotId,
    required this.lotName,
    required this.slotId,
    required this.slotNumber,
    required this.level,
    required this.pricePerHour,
    this.priceRules,
    this.freeCancellationMinutes = 10,
  });

  final int lotId;
  final String lotName;
  final int slotId;
  final String slotNumber;
  final String level;
  final int pricePerHour;

  /// The lot's daily cap and special prices; just the hourly price if unknown.
  final PriceRules? priceRules;

  PriceRules get rules => priceRules ?? PriceRules(pricePerHour: pricePerHour);

  /// The lot's free cancellation window, in minutes.
  final int freeCancellationMinutes;

  /// "A04 · Level B1"
  String get slotLabel => '$slotNumber · Level $level';

  @override
  List<Object?> get props => [
    lotId,
    lotName,
    slotId,
    slotNumber,
    level,
    pricePerHour,
    priceRules,
    freeCancellationMinutes,
  ];
}
