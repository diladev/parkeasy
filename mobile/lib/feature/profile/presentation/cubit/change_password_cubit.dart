import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/feature/profile/domain/usecases/change_password.dart';

/// Belongs to the Change password screen only.
class ChangePasswordCubit extends Cubit<SubmitState<void>> {
  ChangePasswordCubit(this._changePassword) : super(const SubmitState());

  final ChangePassword _changePassword;

  Future<void> submit({
    required String currentPassword,
    required String newPassword,
  }) async {
    if (state.isSubmitting) return;
    emit(const SubmitState(status: SubmitStatus.submitting));

    final result = await _changePassword(
      ChangePasswordParams(
        currentPassword: currentPassword,
        newPassword: newPassword,
      ),
    );
    result.fold(
      (failure) => emit(
        SubmitState(status: SubmitStatus.failure, message: failure.message),
      ),
      (_) => emit(const SubmitState(status: SubmitStatus.success)),
    );
  }
}
