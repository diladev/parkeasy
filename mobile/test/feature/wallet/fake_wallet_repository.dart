import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction_page.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';

/// A wallet server in memory: top-ups are paid or declined only through
/// [decideTestPayment], like the API's test bank.
class FakeWalletRepository implements WalletRepository {
  int balance = 0;
  final Map<int, TopUp> topUps = {};
  int startedTopUps = 0;
  int _nextId = 1;

  /// When set, every call fails with this message.
  String? failWith;

  static TopUp pending(int id, int amount) => TopUp(
    id: id,
    status: TopUpStatus.pending,
    amount: amount,
    provider: 'mock',
    readableCode: 'PE-TEST-0001',
    appLink: 'parkeasy-mock-fib://pay/provider-$id',
    validUntil: DateTime.now().add(const Duration(minutes: 15)),
  );

  TopUp _withStatus(TopUp topUp, TopUpStatus status) => TopUp(
    id: topUp.id,
    status: status,
    amount: topUp.amount,
    provider: topUp.provider,
    readableCode: topUp.readableCode,
    appLink: topUp.appLink,
    validUntil: topUp.validUntil,
  );

  ResultFuture<T> _answer<T>(T Function() value) async {
    final message = failWith;
    if (message != null) {
      return Left(APIFailure(message: message, statusCode: 400));
    }
    return Right(value());
  }

  @override
  ResultFuture<int> getBalance() => _answer(() => balance);

  @override
  ResultFuture<WalletTransactionPage> getTransactions({int page = 1}) =>
      _answer(
        () => const WalletTransactionPage(transactions: [], hasMore: false),
      );

  @override
  ResultFuture<TopUp> startTopUp(int amount) => _answer(() {
    startedTopUps++;
    final topUp = pending(_nextId++, amount);
    return topUps[topUp.id] = topUp;
  });

  @override
  ResultFuture<TopUp> getTopUp(int topUpId) => _answer(() => topUps[topUpId]!);

  @override
  ResultFuture<TopUp> cancelTopUp(int topUpId) => _answer(() {
    final topUp = topUps[topUpId]!;
    if (!topUp.isPending) return topUp;
    return topUps[topUpId] = _withStatus(topUp, TopUpStatus.cancelled);
  });

  @override
  ResultVoid decideTestPayment(TopUp topUp, {required bool approve}) =>
      _answer(() {
        final current = topUps[topUp.id]!;
        if (!current.isPending) return;
        topUps[topUp.id] = _withStatus(
          current,
          approve ? TopUpStatus.paid : TopUpStatus.declined,
        );
        if (approve) balance += current.amount;
      });
}
