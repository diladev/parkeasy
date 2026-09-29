import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class ForgotPasswordWithParams extends Equatable {
  final String email;

  const ForgotPasswordWithParams({required this.email});

  @override
  List<Object?> get props => [email];
}

class ForgotPassword extends UsecaseWithParams<void, ForgotPasswordWithParams> {
  final AuthenticationRepository _repository;
  ForgotPassword(this._repository);

  @override
  ResultVoid call(ForgotPasswordWithParams params) async =>
      _repository.forgotPassword(email: params.email);
}
