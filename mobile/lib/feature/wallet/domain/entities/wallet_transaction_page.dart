import 'package:equatable/equatable.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction.dart';

/// One page of the wallet history, and whether more pages follow.
class WalletTransactionPage extends Equatable {
  const WalletTransactionPage({
    required this.transactions,
    required this.hasMore,
  });

  final List<WalletTransaction> transactions;
  final bool hasMore;

  @override
  List<Object?> get props => [transactions, hasMore];
}
