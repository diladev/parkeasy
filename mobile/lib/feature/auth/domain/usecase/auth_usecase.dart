import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/entities/user_entity.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class UserLoginWithParams extends Equatable {
  final String email;
  final String password;

  const UserLoginWithParams({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class UserLogin extends UsecaseWithParams<User, UserLoginWithParams> {
  final AuthenticationRepository _repository;
  UserLogin(this._repository);

  @override
  ResultFuture<User> call(UserLoginWithParams params) async =>
      _repository.userLogin(email: params.email, password: params.password);

  Future<bool> checkAuthStatus() async {
    final result = await _repository.userAuthenticated();
    return result.fold((_) => false, (isAuthenticated) => isAuthenticated);
  }
}

class UserLogout extends UsecaseWithoutParams<void> {
  final AuthenticationRepository _repository;
  const UserLogout(this._repository);

  @override
  ResultVoid call() async => _repository.userLogout();
}

class UserRegisterWithParams extends Equatable {
  final String email;
  final String password;
  final String name;
  final String phone;

  const UserRegisterWithParams({
    required this.email,
    required this.password,
    required this.name,
    required this.phone,
  });

  @override
  List<Object?> get props => [email, password, name, phone];
}

class UserRegister extends UsecaseWithParams<User, UserRegisterWithParams> {
  final AuthenticationRepository _repository;
  UserRegister(this._repository);

  @override
  ResultFuture<User> call(UserRegisterWithParams params) async =>
      _repository.userRegister(
        email: params.email,
        password: params.password,
        name: params.name,
        phone: params.phone,
      );
}

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

class VerifyOtpWithParams extends Equatable {
  final String email;
  final String otp;

  const VerifyOtpWithParams({required this.email, required this.otp});

  @override
  List<Object?> get props => [email, otp];
}

class VerifyOtp extends UsecaseWithParams<void, VerifyOtpWithParams> {
  final AuthenticationRepository _repository;
  VerifyOtp(this._repository);

  @override
  ResultVoid call(VerifyOtpWithParams params) async =>
      _repository.verifyOtp(email: params.email, otp: params.otp);
}

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
