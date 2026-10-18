import 'package:equatable/equatable.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction.dart';
import 'package:mobile/feature/wallet/domain/usecases/start_top_up.dart';

enum WalletStatus { loading, loaded, failure }

class WalletState extends Equatable {
  const WalletState({
    this.status = WalletStatus.loading,
    this.balance = 0,
    this.transactions = const [],
    this.page = 0,
    this.hasMore = false,
    this.isLoadingMore = false,
    this.amount = defaultAmount,
    this.isStartingTopUp = false,
    this.startedTopUp,
    this.topUpSerial = 0,
    this.errorMessage,
    this.errorSerial = 0,
  });

  /// The quick picks under the amount field, in whole Iraqi dinars.
  static const List<int> presets = [5000, 10000, 25000, 50000];
  static const int defaultAmount = 10000;

  final WalletStatus status;

  /// Whole Iraqi dinars.
  final int balance;
  final List<WalletTransaction> transactions;

  /// The last page of history loaded.
  final int page;
  final bool hasMore;
  final bool isLoadingMore;

  /// What the user wants to top up; 0 while the field is empty.
  final int amount;
  final bool isStartingTopUp;

  /// The top-up just started, to pay on the next screen.
  final TopUp? startedTopUp;

  /// New for every top-up started, so the screen opens each one once.
  final int topUpSerial;
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  bool get isAmountValid =>
      amount >= StartTopUp.minAmount && amount <= StartTopUp.maxAmount;

  WalletState copyWith({
    WalletStatus? status,
    int? balance,
    List<WalletTransaction>? transactions,
    int? page,
    bool? hasMore,
    bool? isLoadingMore,
    int? amount,
    bool? isStartingTopUp,
    TopUp? startedTopUp,
    int? topUpSerial,
    String? errorMessage,
    int? errorSerial,
  }) {
    return WalletState(
      status: status ?? this.status,
      balance: balance ?? this.balance,
      transactions: transactions ?? this.transactions,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      amount: amount ?? this.amount,
      isStartingTopUp: isStartingTopUp ?? this.isStartingTopUp,
      startedTopUp: startedTopUp ?? this.startedTopUp,
      topUpSerial: topUpSerial ?? this.topUpSerial,
      errorMessage: errorMessage ?? this.errorMessage,
      errorSerial: errorSerial ?? this.errorSerial,
    );
  }

  @override
  List<Object?> get props => [
    status,
    balance,
    transactions,
    page,
    hasMore,
    isLoadingMore,
    amount,
    isStartingTopUp,
    startedTopUp,
    topUpSerial,
    errorMessage,
    errorSerial,
  ];
}
