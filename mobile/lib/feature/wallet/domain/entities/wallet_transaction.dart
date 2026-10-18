import 'package:equatable/equatable.dart';

/// What money moved for. The server sends a code ("TOP_UP") and a
/// translated description.
enum WalletTransactionCategory {
  topUp,
  bookingPayment,
  bookingExtension,
  bookingRefund,
  other;

  static WalletTransactionCategory fromApi(String? code) => switch (code) {
    'TOP_UP' => topUp,
    'BOOKING_PAYMENT' => bookingPayment,
    'BOOKING_EXTENSION' => bookingExtension,
    'BOOKING_REFUND' => bookingRefund,
    _ => other,
  };
}

/// One line of the wallet history.
class WalletTransaction extends Equatable {
  const WalletTransaction({
    required this.id,
    required this.isCredit,
    required this.amount,
    required this.category,
    required this.description,
    required this.createdAt,
    this.lotName,
  });

  final int id;

  /// Money in (top-up, refund) or out (booking payment).
  final bool isCredit;

  /// Always positive, in whole Iraqi dinars; [isCredit] says which way.
  final int amount;
  final WalletTransactionCategory category;

  /// "Booking payment", in the app's language.
  final String description;
  final DateTime createdAt;

  /// The lot a booking payment or refund was for.
  final String? lotName;

  @override
  List<Object?> get props => [
    id,
    isCredit,
    amount,
    category,
    description,
    createdAt,
    lotName,
  ];
}
