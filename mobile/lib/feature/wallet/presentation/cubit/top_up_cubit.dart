import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/usecases/cancel_top_up.dart';
import 'package:mobile/feature/wallet/domain/usecases/decide_test_payment.dart';
import 'package:mobile/feature/wallet/domain/usecases/get_top_up.dart';
import 'top_up_state.dart';

/// One top-up while the user pays it.
///
/// The payment is approved outside the app (in the banking app), so the
/// server is asked every few seconds until it's paid, declined or expired.
/// The server, not the app, decides that: it checks with the provider.
class TopUpCubit extends Cubit<TopUpState> {
  TopUpCubit(
    this._getTopUp,
    this._cancelTopUp,
    this._decideTestPayment, {
    required TopUp topUp,
  }) : super(TopUpState(topUp: topUp)) {
    if (topUp.isPending) {
      _poll = Timer.periodic(pollInterval, (_) => refresh());
    }
  }

  final GetTopUp _getTopUp;
  final CancelTopUp _cancelTopUp;
  final DecideTestPayment _decideTestPayment;

  static const Duration pollInterval = Duration(seconds: 3);

  Timer? _poll;
  bool _isRefreshing = false;

  /// Asks the server where the payment is. A failed check is retried on
  /// the next tick, so it isn't shown.
  Future<void> refresh() async {
    if (!state.topUp.isPending || _isRefreshing) return;
    _isRefreshing = true;
    final result = await _getTopUp(state.topUp.id);
    _isRefreshing = false;
    if (isClosed) return;
    result.fold((_) {}, _update);
  }

  /// The test bank: pay as the customer would in the FIB app.
  Future<void> approve() => _decide(approve: true);

  /// The test bank: refuse as the customer would in the FIB app.
  Future<void> decline() => _decide(approve: false);

  Future<void> _decide({required bool approve}) async {
    if (!state.topUp.isPending || state.isBusy) return;
    emit(
      state.copyWith(
        action: approve ? TopUpAction.approving : TopUpAction.declining,
      ),
    );

    final result = await _decideTestPayment(
      DecideTestPaymentParams(topUp: state.topUp, approve: approve),
    );
    if (isClosed) return;

    await result.fold(
      (failure) async => _showError(failure.message),
      // The bank only answers "done"; the server has the result.
      (_) async {
        final topUp = await _getTopUp(state.topUp.id);
        if (isClosed) return;
        topUp.fold((failure) => _showError(failure.message), _update);
      },
    );
    if (!isClosed) emit(state.copyWith(action: TopUpAction.none));
  }

  /// Gives up on the top-up. If it was paid a moment before, the server
  /// keeps it paid and says so.
  Future<void> cancel() async {
    if (!state.topUp.isPending || state.isBusy) return;
    emit(state.copyWith(action: TopUpAction.cancelling));

    final result = await _cancelTopUp(state.topUp.id);
    if (isClosed) return;
    result.fold((failure) => _showError(failure.message), _update);
    emit(state.copyWith(action: TopUpAction.none));
  }

  void _update(TopUp topUp) {
    emit(state.copyWith(topUp: topUp));
    if (!topUp.isPending) _poll?.cancel();
  }

  void _showError(String message) => emit(
    state.copyWith(errorMessage: message, errorSerial: state.errorSerial + 1),
  );

  @override
  Future<void> close() {
    _poll?.cancel();
    return super.close();
  }
}
