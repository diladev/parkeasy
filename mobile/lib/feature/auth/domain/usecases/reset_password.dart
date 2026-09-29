import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class ResetPasswordWithParams extends Equatable {
  final String token;
  final String newPassword;

  const ResetPasswordWithParams({
    required this.token,
    required this.newPassword,
  });

  @override
  List<Object?> get props => [token, newPassword];
}

class ResetPassword extends UsecaseWithParams<void, ResetPasswordWithParams> {
  final AuthenticationRepository _repository;
  ResetPassword(this._repository);

  @override
  ResultVoid call(ResetPasswordWithParams params) async => _repository
      .resetPassword(token: params.token, newPassword: params.newPassword);
}
