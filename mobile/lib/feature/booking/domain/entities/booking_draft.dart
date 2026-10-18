import 'package:equatable/equatable.dart';

/// What the user picked on the lot details screen, before paying.
class BookingDraft extends Equatable {
  const BookingDraft({
    required this.lotId,
    required this.lotName,
    required this.slotId,
    required this.slotNumber,
    required this.level,
    required this.pricePerHour,
  });

  final int lotId;
  final String lotName;
  final int slotId;
  final String slotNumber;
  final String level;
  final int pricePerHour;

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
  ];
}
