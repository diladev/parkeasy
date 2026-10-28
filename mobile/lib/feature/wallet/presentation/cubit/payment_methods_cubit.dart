import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_balance.dart';

enum PaymentMethodsStatus { loading, loaded, failure }

class PaymentMethodsState extends Equatable {
  const PaymentMethodsState({
    this.status = PaymentMethodsStatus.loading,
    this.balance = 0,
    this.errorMessage,
  });

  final PaymentMethodsStatus status;

  /// The wallet balance, in whole Iraqi dinars.
  final int balance;
  final String? errorMessage;

  @override
  List<Object?> get props => [status, balance, errorMessage];
}

/// Payment methods: the wallet pays for bookings, so its balance is shown.
class PaymentMethodsCubit extends Cubit<PaymentMethodsState> {
  PaymentMethodsCubit(this._getBalance) : super(const PaymentMethodsState());

  final GetBalance _getBalance;

  /// Loads the balance; keeps the old one on screen while it reloads.
  Future<void> load() async {
    final hasData = state.status == PaymentMethodsStatus.loaded;
    if (!hasData) emit(const PaymentMethodsState());

    final result = await _getBalance();
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        PaymentMethodsState(
          status: hasData
              ? PaymentMethodsStatus.loaded
              : PaymentMethodsStatus.failure,
          balance: state.balance,
          errorMessage: failure.message,
        ),
      ),
      (balance) => emit(
        PaymentMethodsState(
          status: PaymentMethodsStatus.loaded,
          balance: balance,
        ),
      ),
    );
  }
}
