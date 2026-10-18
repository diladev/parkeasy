import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_balance.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_wallet_transactions.dart';
import 'package:mobile/feature/wallet/domain/usecases/start_top_up.dart';
import 'package:mobile/feature/wallet/presentation/cubit/wallet_cubit.dart';
import 'package:mobile/feature/wallet/presentation/cubit/wallet_state.dart';

import 'fake_wallet_repository.dart';

void main() {
  late FakeWalletRepository repository;
  late WalletCubit cubit;

  setUp(() {
    repository = FakeWalletRepository()..balance = 26000;
    cubit = WalletCubit(
      GetBalance(repository),
      GetWalletTransactions(repository),
      StartTopUp(repository),
    );
  });

  tearDown(() => cubit.close());

  test('loads the balance', () async {
    await cubit.load();

    expect(cubit.state.status, WalletStatus.loaded);
    expect(cubit.state.balance, 26000);
  });

  test('a failed first load shows the error screen', () async {
    repository.failWith = 'Offline';

    await cubit.load();

    expect(cubit.state.status, WalletStatus.failure);
    expect(cubit.state.errorMessage, 'Offline');
  });

  test('starts a top-up of the chosen amount', () async {
    await cubit.load();
    cubit.changeAmount(25000);

    await cubit.startTopUp();

    expect(cubit.state.startedTopUp?.amount, 25000);
    expect(cubit.state.topUpSerial, 1);
    expect(cubit.state.isStartingTopUp, isFalse);
  });

  test('refuses amounts outside the server limits without calling it', () async {
    await cubit.load();

    for (final amount in [0, 999, StartTopUp.maxAmount + 1]) {
      cubit.changeAmount(amount);
      await cubit.startTopUp();
    }

    expect(repository.startedTopUps, 0);
    expect(cubit.state.topUpSerial, 0);
    expect(cubit.state.errorSerial, 3);
  });
}
