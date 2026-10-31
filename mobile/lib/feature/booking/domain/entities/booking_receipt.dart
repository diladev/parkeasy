import 'package:equatable/equatable.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// How a booking was paid.
enum ReceiptPaymentMethod {
  wallet,
  card;

  String get label => switch (this) {
    ReceiptPaymentMethod.wallet => l10n.parkEasyWallet,
    ReceiptPaymentMethod.card => l10n.card,
  };

  static ReceiptPaymentMethod fromApi(String? value) =>
      value == 'card' ? card : wallet;
}

/// Where the money for a booking ended up.
enum ReceiptStatus {
  paid,
  refunded,
  partlyRefunded,
  cancelled;

  String get label => switch (this) {
    ReceiptStatus.paid => l10n.receiptPaid,
    ReceiptStatus.refunded => l10n.receiptRefunded,
    ReceiptStatus.partlyRefunded => l10n.receiptPartlyRefunded,
    ReceiptStatus.cancelled => l10n.receiptCancelled,
  };
}

/// What a booking cost, from the wallet's records: what was charged and
/// what came back. Amounts are whole Iraqi dinars.
class BookingReceipt extends Equatable {
  const BookingReceipt({
    required this.receiptNumber,
    required this.issuedAt,
    required this.paymentMethod,
    required this.subtotal,
    required this.refunded,
    required this.total,
    required this.booking,
  });

  /// "PE-000123"
  final String receiptNumber;

  /// When it was paid (or booked, if nothing was charged).
  final DateTime issuedAt;
  final ReceiptPaymentMethod paymentMethod;

  /// Everything charged: the booking and its extensions.
  final int subtotal;
  final int refunded;

  /// What it cost in the end.
  final int total;
  final Booking booking;

  ReceiptStatus get status {
    if (refunded > 0) {
      return refunded >= subtotal
          ? ReceiptStatus.refunded
          : ReceiptStatus.partlyRefunded;
    }
    return booking.status == BookingStatus.cancelled
        ? ReceiptStatus.cancelled
        : ReceiptStatus.paid;
  }

  @override
  List<Object?> get props => [
    receiptNumber,
    issuedAt,
    paymentMethod,
    subtotal,
    refunded,
    total,
    booking,
  ];
}
