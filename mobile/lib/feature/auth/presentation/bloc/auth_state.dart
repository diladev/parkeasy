import 'package:equatable/equatable.dart';

abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {}

class AuthUnauthenticated extends AuthState {}

class ForgotPasswordSent extends AuthState {}

class PasswordResetSuccess extends AuthState {}

class OtpVerifiedSuccess extends AuthState {
  final String token;

  OtpVerifiedSuccess({required this.token});

  @override
  List<Object?> get props => [token];
}

class AuthError extends AuthState {
  final String message;

  AuthError(this.message);

  @override
  List<Object?> get props => [message];
}

class LogInError extends AuthError {
  LogInError(super.message);
}

class RegistrationError extends AuthError {
  RegistrationError(super.message);
}

class ForgotPasswordError extends AuthError {
  ForgotPasswordError(super.message);
}

class OtpVerificationError extends AuthError {
  OtpVerificationError(super.message);
}

class PasswordResetError extends AuthError {
  PasswordResetError(super.message);
}
