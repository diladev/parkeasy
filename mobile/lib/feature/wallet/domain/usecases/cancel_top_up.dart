import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';

class CancelTopUp extends UsecaseWithParams<TopUp, int> {
  const CancelTopUp(this._repository);
  final WalletRepository _repository;

  @override
  ResultFuture<TopUp> call(int topUpId) => _repository.cancelTopUp(topUpId);
}
