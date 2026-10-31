import 'package:equatable/equatable.dart';
import 'package:mobile/core/l10n/l10n.dart';

enum BookingStatus {
  active,
  completed,
  cancelled;

  /// "Active", in the app's language.
  String get label => switch (this) {
    BookingStatus.active => l10n.statusActive,
    BookingStatus.completed => l10n.statusCompleted,
    BookingStatus.cancelled => l10n.statusCancelled,
  };

  static BookingStatus fromApi(String? value) =>
      BookingStatus.values.firstWhere(
        (status) => status.name == value,
        orElse: () => BookingStatus.completed,
      );
}

/// One of the user's bookings, with just what the home screen shows.
class BookingSummary extends Equatable {
  const BookingSummary({
    required this.id,
    required this.status,
    required this.lotId,
    required this.lotName,
    required this.slotNumber,
    required this.startTime,
    required this.endTime,
  });

  final int id;
  final BookingStatus status;
  final int lotId;
  final String lotName;
  final String slotNumber;
  final DateTime startTime;
  final DateTime endTime;

  @override
  List<Object?> get props => [
    id,
    status,
    lotId,
    lotName,
    slotNumber,
    startTime,
    endTime,
  ];
}
