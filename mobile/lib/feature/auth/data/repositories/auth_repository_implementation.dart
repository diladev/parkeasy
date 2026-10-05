import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/data/repositories/auth_local_data_source.dart';
import 'package:mobile/feature/auth/data/repositories/auth_remote_data_source.dart';
import 'package:mobile/feature/auth/data/repositories/auth_token_provider.dart';
import 'package:mobile/feature/auth/domain/entities/auth_entity.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';
import 'package:mobile/feature/profile/data/repositories/profile_local_data_source.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';

class AuthenticationRepositoryImpl implements AuthenticationRepository {
  AuthenticationRepositoryImpl(
    this._remoteDataSource,
    this._authCache,
    this._userCache,
    this._tokens,
  );

  final AuthenticationRemoteDataSource _remoteDataSource;
  final AuthenticationLocalDataSource _authCache;
  final ProfileLocalDataSource _userCache;
  final AuthTokenProvider _tokens;

  @override
  ResultFuture<(User, Auth)> userLogin({
    required String email,
    required String password,
  }) {
    return _guard(() async {
      final (user, auth) = await _remoteDataSource.login(
        email: email,
        password: password,
      );
      await _tokens.saveSession(user, auth);
      return (user, auth);
    });
  }

  @override
  ResultFuture<(User, Auth)> userRegister({
    required String email,
    required String password,
    required String name,
    required String phone,
  }) {
    return _guard(() async {
      final (user, auth) = await _remoteDataSource.register(
        email: email,
        password: password,
        name: name,
        phone: phone,
      );
      await _tokens.saveSession(user, auth);
      return (user, auth);
    });
  }

  @override
  ResultFuture<(User, Auth)> refreshUser() {
    return _guard(() async {
      final token = await _tokens.refreshAccessToken();
      final user = _userCache.getUser();
      final auth = _authCache.getAuth();
      if (token == null || user == null || auth == null) {
        throw const APIException(
          message: 'Your session has expired. Please sign in again.',
          statusCode: 401,
        );
      }
      return (user, auth);
    });
  }

  @override
  ResultFuture<bool> userAuthenticated() async {
    if (_authCache.getAuth() == null || _userCache.getUser() == null) {
      await _tokens.clearSession();
      return const Right(false);
    }
    try {
      final token = await _tokens.getAccessToken();
      return Right(token != null);
    } on APIException {
      return const Right(true);
    }
  }

  @override
  ResultVoid userLogout() async {
    try {
      await _remoteDataSource.logout();
    } on APIException {
      // Signing out on this device must work even offline.
    } finally {
      await _tokens.clearSession();
    }
    return const Right(null);
  }

  @override
  ResultVoid clearSession() async {
    await _tokens.clearSession();
    return const Right(null);
  }

  @override
  ResultVoid forgotPassword({required String email}) {
    return _guard(() => _remoteDataSource.forgotPassword(email: email));
  }

  @override
  ResultFuture<String> verifyOtp({required String email, required String otp}) {
    return _guard(() => _remoteDataSource.verifyOtp(email: email, otp: otp));
  }

  @override
  ResultVoid resetPassword({
    required String token,
    required String newPassword,
  }) {
    return _guard(
      () => _remoteDataSource.resetPassword(
        token: token,
        newPassword: newPassword,
      ),
    );
  }

  ResultFuture<T> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    } catch (_) {
      return const Left(
        APIFailure(
          message: 'Something went wrong. Please try again.',
          statusCode: 500,
        ),
      );
    }
  }
}
