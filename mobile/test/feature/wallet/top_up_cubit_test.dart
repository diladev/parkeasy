import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/usecases/cancel_top_up.dart';
import 'package:mobile/feature/wallet/domain/usecases/decide_test_payment.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_top_up.dart';
import 'package:mobile/feature/wallet/presentation/cubit/top_up_cubit.dart';
import 'package:mobile/feature/wallet/presentation/cubit/top_up_state.dart';

import 'fake_wallet_repository.dart';

void main() {
  late FakeWalletRepository repository;
  late TopUpCubit cubit;

  setUp(() async {
    repository = FakeWalletRepository();
    final started = await repository.startTopUp(10000);
    cubit = TopUpCubit(
      GetTopUp(repository),
      CancelTopUp(repository),
      DecideTestPayment(repository),
      topUp: started.getOrElse(() => throw StateError('not started')),
    );
  });

  tearDown(() => cubit.close());

  test('approving in the test bank shows the payment as paid', () async {
    await cubit.approve();

    expect(cubit.state.topUp.status, TopUpStatus.paid);
    expect(cubit.state.action, TopUpAction.none);
    expect(repository.balance, 10000);
  });

  test('declining shows it declined and adds nothing', () async {
    await cubit.decline();

    expect(cubit.state.topUp.status, TopUpStatus.declined);
    expect(repository.balance, 0);
  });

  test('a finished payment cannot be decided again', () async {
    await cubit.approve();
    await cubit.decline();
    await cubit.approve();

    expect(cubit.state.topUp.status, TopUpStatus.paid);
    expect(repository.balance, 10000);
  });

  test('cancelling ends the top-up', () async {
    await cubit.cancel();

    expect(cubit.state.topUp.status, TopUpStatus.cancelled);
    expect(cubit.state.action, TopUpAction.none);
  });

  test('refresh picks up a payment approved elsewhere', () async {
    // As if the customer paid in the banking app.
    await repository.decideTestPayment(cubit.state.topUp, approve: true);

    await cubit.refresh();

    expect(cubit.state.topUp.status, TopUpStatus.paid);
  });

  test('a server error is shown and the payment stays open', () async {
    repository.failWith = 'The payment service is unavailable.';

    await cubit.approve();

    expect(cubit.state.topUp.isPending, isTrue);
    expect(cubit.state.errorMessage, 'The payment service is unavailable.');
    expect(cubit.state.errorSerial, 1);
    expect(cubit.state.action, TopUpAction.none);
  });
}
