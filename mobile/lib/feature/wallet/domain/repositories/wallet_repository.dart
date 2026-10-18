import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction_page.dart';

abstract class WalletRepository {
  /// The balance in whole Iraqi dinars.
  ResultFuture<int> getBalance();

  /// Newest first.
  ResultFuture<WalletTransactionPage> getTransactions({int page = 1});

  /// Starts paying [amount] into the wallet; the user approves it next.
  ResultFuture<TopUp> startTopUp(int amount);

  /// The top-up as it is now (the server checks with the provider).
  ResultFuture<TopUp> getTopUp(int topUpId);

  ResultFuture<TopUp> cancelTopUp(int topUpId);

  /// The test bank: what approving or declining in the banking app does.
  ResultVoid decideTestPayment(TopUp topUp, {required bool approve});
}
