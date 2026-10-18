import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';

class GetBalance extends UsecaseWithoutParams<int> {
  const GetBalance(this._repository);
  final WalletRepository _repository;

  @override
  ResultFuture<int> call() => _repository.getBalance();
}
