import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/data/repositories/wallet_remote_data_source.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction_page.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';

class WalletRepositoryImpl implements WalletRepository {
  WalletRepositoryImpl(this._remoteDataSource);

  final WalletRemoteDataSource _remoteDataSource;

  @override
  ResultFuture<int> getBalance() => _guard(_remoteDataSource.getBalance);

  @override
  ResultFuture<WalletTransactionPage> getTransactions({int page = 1}) {
    return _guard(() => _remoteDataSource.getTransactions(page: page));
  }

  @override
  ResultFuture<TopUp> startTopUp(int amount) {
    return _guard(() => _remoteDataSource.startTopUp(amount));
  }

  @override
  ResultFuture<TopUp> getTopUp(int topUpId) {
    return _guard(() => _remoteDataSource.getTopUp(topUpId));
  }

  @override
  ResultFuture<TopUp> cancelTopUp(int topUpId) {
    return _guard(() => _remoteDataSource.cancelTopUp(topUpId));
  }

  @override
  ResultVoid decideTestPayment(TopUp topUp, {required bool approve}) {
    return _guard(
      () => _remoteDataSource.decideTestPayment(topUp, approve: approve),
    );
  }

  ResultFuture<T> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    } catch (_) {
      return Left(
        APIFailure(message: l10n.somethingWentWrong, statusCode: 500),
      );
    }
  }
}
