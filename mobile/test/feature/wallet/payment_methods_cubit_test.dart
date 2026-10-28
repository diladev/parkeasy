import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_balance.dart';
import 'package:mobile/feature/wallet/presentation/cubit/payment_methods_cubit.dart';

import 'fake_wallet_repository.dart';

void main() {
  late FakeWalletRepository repository;
  late PaymentMethodsCubit cubit;

  setUp(() {
    repository = FakeWalletRepository()..balance = 12500;
    cubit = PaymentMethodsCubit(GetBalance(repository));
  });

  tearDown(() => cubit.close());

  test('shows the wallet balance', () async {
    await cubit.load();
    expect(cubit.state.status, PaymentMethodsStatus.loaded);
    expect(cubit.state.balance, 12500);
  });

  test('offers a retry when the balance fails to load', () async {
    repository.failWith = 'No connection.';
    await cubit.load();
    expect(cubit.state.status, PaymentMethodsStatus.failure);
    expect(cubit.state.errorMessage, 'No connection.');
  });

  test('keeps the balance on screen when a reload fails', () async {
    await cubit.load();
    repository.failWith = 'No connection.';
    await cubit.load();
    expect(cubit.state.status, PaymentMethodsStatus.loaded);
    expect(cubit.state.balance, 12500);
  });
}
