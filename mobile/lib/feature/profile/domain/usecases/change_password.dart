import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class ChangePassword extends UsecaseWithParams<void, ChangePasswordParams> {
  const ChangePassword(this._repository);
  final ProfileRepository _repository;

  @override
  ResultVoid call(ChangePasswordParams params) => _repository.changePassword(
    currentPassword: params.currentPassword,
    newPassword: params.newPassword,
  );
}

class ChangePasswordParams extends Equatable {
  const ChangePasswordParams({
    required this.currentPassword,
    required this.newPassword,
  });

  final String currentPassword;
  final String newPassword;

  @override
  List<Object?> get props => [currentPassword, newPassword];
}
