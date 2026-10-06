import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/feature/profile/domain/usecases/delete_account.dart';

/// Belongs to the Delete account screen only. On success the screen tells
/// AuthBloc, which signs out and returns to the login screen.
class DeleteAccountCubit extends Cubit<SubmitState<void>> {
  DeleteAccountCubit(this._deleteAccount) : super(const SubmitState());

  final DeleteAccount _deleteAccount;

  Future<void> submit({required String password}) async {
    if (state.isSubmitting) return;
    emit(const SubmitState(status: SubmitStatus.submitting));

    final result = await _deleteAccount(DeleteAccountParams(password: password));
    result.fold(
      (failure) => emit(
        SubmitState(status: SubmitStatus.failure, message: failure.message),
      ),
      (_) => emit(const SubmitState(status: SubmitStatus.success)),
    );
  }
}
