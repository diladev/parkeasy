import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';

/// Starts a top-up of the given amount, in whole Iraqi dinars.
class StartTopUp extends UsecaseWithParams<TopUp, int> {
  const StartTopUp(this._repository);
  final WalletRepository _repository;

  /// The server's limits for one top-up.
  static const int minAmount = 1000;
  static const int maxAmount = 1000000;

  @override
  ResultFuture<TopUp> call(int amount) => _repository.startTopUp(amount);
}
