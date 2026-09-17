import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class AppStarted extends AuthEvent {}

class LoggedIn extends AuthEvent {
  final String email;
  final String password;

  LoggedIn({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class Registered extends AuthEvent {
  final String email;
  final String password;
  final String name;
  final String phone;

  Registered({
    required this.email,
    required this.password,
    required this.name,
    required this.phone,
  });

  @override
  List<Object?> get props => [email, password, name, phone];
}

class LoggedOut extends AuthEvent {}

class ForgotPasswordRequested extends AuthEvent {
  final String email;

  ForgotPasswordRequested({required this.email});

  @override
  List<Object?> get props => [email];
}

class OtpVerified extends AuthEvent {
  final String email;
  final String otp;

  OtpVerified({required this.email, required this.otp});

  @override
  List<Object?> get props => [email, otp];
}

class PasswordReset extends AuthEvent {
  final String token;
  final String newPassword;

  PasswordReset({required this.token, required this.newPassword});

  @override
  List<Object?> get props => [token, newPassword];
}

class ResetToUnauthorized extends AuthEvent {}
