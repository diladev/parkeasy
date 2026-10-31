import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_balance.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_wallet_transactions.dart';
import 'package:mobile/feature/wallet/domain/usecases/start_top_up.dart';
import 'wallet_state.dart';

/// The wallet: balance, history page by page, and starting a top-up.
class WalletCubit extends Cubit<WalletState> {
  WalletCubit(this._getBalance, this._getTransactions, this._startTopUp)
    : super(const WalletState());

  final GetBalance _getBalance;
  final GetWalletTransactions _getTransactions;
  final StartTopUp _startTopUp;

  /// Only the newest load may update the screen.
  int _latestLoad = 0;

  /// The balance and the first page of history, side by side.
  Future<void> load() async {
    final loadId = ++_latestLoad;
    final hasData = state.status == WalletStatus.loaded;
    if (!hasData) emit(state.copyWith(status: WalletStatus.loading));

    final balanceRequest = _getBalance();
    final pageRequest = _getTransactions(1);
    final balance = await balanceRequest;
    final page = await pageRequest;
    if (isClosed || loadId != _latestLoad) return;

    final failure =
        balance.fold((failure) => failure, (_) => null) ??
        page.fold((failure) => failure, (_) => null);
    if (failure != null) {
      emit(
        state.copyWith(
          status: hasData ? WalletStatus.loaded : WalletStatus.failure,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      );
      return;
    }

    page.fold((_) {}, (history) {
      emit(
        state.copyWith(
          status: WalletStatus.loaded,
          balance: balance.getOrElse(() => state.balance),
          transactions: history.transactions,
          page: 1,
          hasMore: history.hasMore,
          isLoadingMore: false,
        ),
      );
    });
  }

  /// The next page of history, when the list is scrolled to its end.
  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoadingMore) return;
    final loadId = _latestLoad;
    emit(state.copyWith(isLoadingMore: true));

    final result = await _getTransactions(state.page + 1);
    if (isClosed || loadId != _latestLoad) return;

    result.fold(
      (failure) => emit(
        state.copyWith(
          isLoadingMore: false,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (page) => emit(
        state.copyWith(
          transactions: [...state.transactions, ...page.transactions],
          page: state.page + 1,
          hasMore: page.hasMore,
          isLoadingMore: false,
        ),
      ),
    );
  }

  /// A quick pick, or what was typed (0 when the field is empty).
  void changeAmount(int amount) => emit(state.copyWith(amount: amount));

  Future<void> startTopUp() async {
    if (state.isStartingTopUp) return;
    if (!state.isAmountValid) {
      _showError(
        l10n.topUpBetween(
          Formatters.money(StartTopUp.minAmount),
          Formatters.money(StartTopUp.maxAmount),
        ),
      );
      return;
    }

    emit(state.copyWith(isStartingTopUp: true));
    final result = await _startTopUp(state.amount);
    if (isClosed) return;

    result.fold(
      (failure) {
        emit(state.copyWith(isStartingTopUp: false));
        _showError(failure.message);
      },
      (topUp) => emit(
        state.copyWith(
          isStartingTopUp: false,
          startedTopUp: topUp,
          topUpSerial: state.topUpSerial + 1,
        ),
      ),
    );
  }

  void _showError(String message) => emit(
    state.copyWith(errorMessage: message, errorSerial: state.errorSerial + 1),
  );
}
