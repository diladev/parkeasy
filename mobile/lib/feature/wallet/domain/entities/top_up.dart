import 'package:equatable/equatable.dart';

/// Where a top-up payment is. Only [pending] can still change.
enum TopUpStatus {
  pending,
  paid,
  declined,
  expired,
  cancelled;

  static TopUpStatus fromApi(String? status) => TopUpStatus.values.firstWhere(
    (value) => value.name == status,
    orElse: () => TopUpStatus.pending,
  );
}

/// Money being added to the wallet through the payment provider (FIB).
/// The wallet is only credited once the provider confirms it was paid.
class TopUp extends Equatable {
  const TopUp({
    required this.id,
    required this.status,
    required this.amount,
    required this.provider,
    required this.readableCode,
    required this.appLink,
    required this.validUntil,
    this.paidAt,
    this.declineReason,
  });

  final int id;
  final TopUpStatus status;

  /// Whole Iraqi dinars.
  final int amount;

  /// "mock" while the API runs the built-in test bank.
  final String provider;

  /// What the customer enters in their banking app, e.g. "PE-4K7Q-M2XD".
  final String readableCode;

  /// Opens the payment in the banking app.
  final String appLink;

  /// After this, the payment can no longer be approved.
  final DateTime validUntil;
  final DateTime? paidAt;
  final String? declineReason;

  bool get isPending => status == TopUpStatus.pending;

  /// The built-in test bank, where the app itself approves or declines.
  bool get isTestPayment => provider == 'mock';

  @override
  List<Object?> get props => [
    id,
    status,
    amount,
    provider,
    readableCode,
    appLink,
    validUntil,
    paidAt,
    declineReason,
  ];
}
