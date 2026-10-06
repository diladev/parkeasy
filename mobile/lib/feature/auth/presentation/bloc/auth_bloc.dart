import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/auth/domain/usecases/clear_session.dart';
import 'package:mobile/feature/auth/domain/usecases/forgot_password.dart';
import 'package:mobile/feature/auth/domain/usecases/reset_password.dart';
import 'package:mobile/feature/auth/domain/usecases/user_login.dart';
import 'package:mobile/feature/auth/domain/usecases/user_logout.dart';
import 'package:mobile/feature/auth/domain/usecases/user_register.dart';
import 'package:mobile/feature/auth/domain/usecases/verify_otp.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final UserLogin _userLogin;
  final UserLogout _userLogout;
  final UserRegister _userRegister;
  final ForgotPassword _forgotPassword;
  final VerifyOtp _verifyOtp;
  final ResetPassword _resetPassword;
  final ClearSession _clearSession;
  late final StreamSubscription<void> _sessionExpiredSubscription;

  AuthBloc(
    this._userLogin,
    this._userLogout,
    this._userRegister,
    this._forgotPassword,
    this._verifyOtp,
    this._resetPassword,
    this._clearSession, {
    required Stream<void> sessionExpired,
  }) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);
    on<LoggedIn>(_onLoggedIn);
    on<LoggedOut>(_onLoggedOut);
    on<Registered>(_onRegistered);
    on<ForgotPasswordRequested>(_onForgotPasswordRequested);
    on<OtpVerified>(_onOtpVerified);
    on<PasswordReset>(_onPasswordReset);
    on<ResetToUnauthorized>(_onResetToUnauthorized);

    // ApiClient reports when a request finds the session is over.
    _sessionExpiredSubscription = sessionExpired.listen(
      (_) => add(
        ResetToUnauthorized(
          message: 'Your session has expired. Please sign in again.',
        ),
      ),
    );
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    // Emitting a "checking" state first guarantees the splash screen sees a
    // change, even if the result is the same state as before.
    emit(AuthLoading());
    try {
      final isAuthenticated = await _userLogin.checkAuthStatus();
      emit(isAuthenticated ? AuthAuthenticated() : AuthUnauthenticated());
    } catch (_) {
      // Never leave the splash screen waiting.
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLoggedIn(LoggedIn event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await _userLogin(
      UserLoginWithParams(email: event.email, password: event.password),
    );
    result.fold(
      (failure) => emit(LogInError(failure.message)),
      (_) => emit(AuthAuthenticated()),
    );
  }

  Future<void> _onLoggedOut(LoggedOut event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    // Never fails: the session is always cleared on this device.
    await _userLogout();
    emit(AuthSignedOut());
  }

  Future<void> _onRegistered(Registered event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await _userRegister(
      UserRegisterWithParams(
        email: event.email,
        password: event.password,
        name: event.name,
        phone: event.phone,
      ),
    );
    result.fold(
      (failure) => emit(RegistrationError(failure.message)),
      (_) => emit(AuthAuthenticated()),
    );
  }

  Future<void> _onForgotPasswordRequested(
    ForgotPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await _forgotPassword(
      ForgotPasswordWithParams(email: event.email),
    );
    result.fold(
      (failure) => emit(ForgotPasswordError(failure.message)),
      (_) => emit(ForgotPasswordSent()),
    );
  }

  Future<void> _onOtpVerified(
    OtpVerified event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await _verifyOtp(
      VerifyOtpWithParams(email: event.email, otp: event.otp),
    );
    result.fold(
      (failure) => emit(OtpVerificationError(failure.message)),
      // The reset token from the API. (It used to pass the email instead,
      // so resetting the password could never work.)
      (resetToken) => emit(OtpVerifiedSuccess(token: resetToken)),
    );
  }

  Future<void> _onPasswordReset(
    PasswordReset event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await _resetPassword(
      ResetPasswordWithParams(
        token: event.token,
        newPassword: event.newPassword,
      ),
    );
    result.fold(
      (failure) => emit(PasswordResetError(failure.message)),
      (_) => emit(PasswordResetSuccess()),
    );
  }

  Future<void> _onResetToUnauthorized(
    ResetToUnauthorized event,
    Emitter<AuthState> emit,
  ) async {
    // Several requests can fail at the same moment and each one reports it.
    // Only the first gets past this check: the state changes right away.
    if (state is! AuthAuthenticated) return;
    emit(AuthLoading());
    // Local only: the session is already over on the server, so there's
    // nothing to tell it (and no valid token to tell it with).
    await _clearSession();
    emit(AuthSignedOut(message: event.message));
  }

  @override
  Future<void> close() async {
    await _sessionExpiredSubscription.cancel();
    return super.close();
  }
}
