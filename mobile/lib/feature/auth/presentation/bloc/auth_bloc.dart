import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/auth/domain/usecase/auth_usecase.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final UserLogin _userLogin;
  final UserLogout _userLogout;
  final UserRegister _userRegister;
  final ForgotPassword _forgotPassword;
  final VerifyOtp _verifyOtp;
  final ResetPassword _resetPassword;

  AuthBloc(
    this._userLogin,
    this._userLogout,
    this._userRegister,
    this._forgotPassword,
    this._verifyOtp,
    this._resetPassword,
  ) : super(AuthInitial()) {
    on<AppStarted>(_onAppStarted);
    on<LoggedIn>(_onLoggedIn);
    on<LoggedOut>(_onLoggedOut);
    on<Registered>(_onRegistered);
    on<ForgotPasswordRequested>(_onForgotPasswordRequested);
    on<OtpVerified>(_onOtpVerified);
    on<PasswordReset>(_onPasswordReset);
  }

  Future<void> _onAppStarted(AppStarted event, Emitter<AuthState> emit) async {
    try {
      final isAuthenticated = await _userLogin.checkAuthStatus();
      if (isAuthenticated) {
        emit(AuthAuthenticated());
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onLoggedIn(LoggedIn event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final result = await _userLogin(
        UserLoginWithParams(email: event.email, password: event.password),
      );
      result.fold(
        (failure) => emit(LogInError(failure.message)),
        (_) => emit(AuthAuthenticated()),
      );
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onLoggedOut(LoggedOut event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final result = await _userLogout();
      result.fold(
        (failure) => emit(AuthError(failure.message)),
        (_) => emit(AuthUnauthenticated()),
      );
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onRegistered(Registered event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
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
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onForgotPasswordRequested(
    ForgotPasswordRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final result = await _forgotPassword(
        ForgotPasswordWithParams(email: event.email),
      );
      result.fold(
        (failure) => emit(ForgotPasswordError(failure.message)),
        (_) => emit(ForgotPasswordSent()),
      );
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onOtpVerified(
    OtpVerified event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final result = await _verifyOtp(
        VerifyOtpWithParams(email: event.email, otp: event.otp),
      );
      result.fold(
        (failure) => emit(OtpVerificationError(failure.message)),
        (token) => emit(OtpVerifiedSuccess(token: event.email)),
      );
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onPasswordReset(
    PasswordReset event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
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
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }
}
