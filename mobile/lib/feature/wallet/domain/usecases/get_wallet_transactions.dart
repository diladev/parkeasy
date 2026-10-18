import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction_page.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';

/// One page of the wallet history; the param is the page number.
class GetWalletTransactions
    extends UsecaseWithParams<WalletTransactionPage, int> {
  const GetWalletTransactions(this._repository);
  final WalletRepository _repository;

  @override
  ResultFuture<WalletTransactionPage> call(int page) =>
      _repository.getTransactions(page: page);
}
