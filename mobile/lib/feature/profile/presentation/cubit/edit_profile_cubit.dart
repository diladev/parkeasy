import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';
import 'package:mobile/feature/profile/domain/usecases/update_profile.dart';

/// Belongs to the Edit profile screen only (created with it, closed with it).
class EditProfileCubit extends Cubit<SubmitState<User>> {
  EditProfileCubit(this._updateProfile) : super(const SubmitState());

  final UpdateProfile _updateProfile;

  Future<void> submit({
    required String name,
    required String email,
    required String phone,
    DateTime? dateOfBirth,
  }) async {
    if (state.isSubmitting) return;
    emit(const SubmitState(status: SubmitStatus.submitting));

    final result = await _updateProfile(
      UpdateProfileParams(
        name: name,
        email: email,
        phone: phone,
        dateOfBirth: dateOfBirth,
      ),
    );
    result.fold(
      (failure) => emit(
        SubmitState(status: SubmitStatus.failure, message: failure.message),
      ),
      (user) => emit(SubmitState(status: SubmitStatus.success, data: user)),
    );
  }
}
