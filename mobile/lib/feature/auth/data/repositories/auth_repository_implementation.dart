import 'package:dartz/dartz.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/data/models/user_model.dart';
import 'package:mobile/feature/auth/data/repositories/auth_remote_data_source.dart';
import 'package:mobile/feature/auth/domain/entities/user_entity.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class AuthenticationRepositoryImpl implements AuthenticationRepository {
  static const String _userCacheKey = 'user';
  final AuthenticationRemoteDataSource _remoteDataSource;
  final SharedPreferences _cachedDataSource;

  AuthenticationRepositoryImpl(this._remoteDataSource, this._cachedDataSource);

  Future<void> _cachedUserData(UserModel user) async {
    await _cachedDataSource.setString(_userCacheKey, user.toJson());
  }

  Future<void> _clearUserData() async {
    await _cachedDataSource.remove(_userCacheKey);
  }

  @override
  ResultVoid forgotPassword({required String email}) async {
    try {
      await _remoteDataSource.forgotPassword(email: email);
      return const Right(null);
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    }
  }

  @override
  ResultFuture<User> refreshUser() async {
    try {
      final userJson = _cachedDataSource.getString(_userCacheKey);
      if (userJson == null) {
        throw const APIException(
          message: 'No user data found',
          statusCode: 401,
        );
      }
      final user = UserModel.fromJson(userJson);
      final refreshed = await _remoteDataSource.refreshToken(
        refreshToken: user.refreshToken,
      );
      await _cachedUserData(refreshed as UserModel);
      return Right(refreshed);
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    }
  }

  @override
  ResultVoid resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      await _remoteDataSource.resetPassword(
        token: token,
        newPassword: newPassword,
      );
      return const Right(null);
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    }
  }

  @override
  ResultFuture<bool> userAuthenticated() async {
    try {
      final userJson = _cachedDataSource.getString(_userCacheKey);
      if (userJson == null) {
        return const Right(false);
      }
      final user = UserModel.fromJson(userJson);
      final now = DateTime.now();

      if (DateTime.parse(user.accessTokenExpiration).isAfter(now)) {
        return const Right(true);
      } else if (DateTime.parse(user.refreshTokenExpiration).isAfter(now)) {
        final result = await refreshUser();
        return result.fold((_) async {
          await _clearUserData();
          return const Right(false);
        }, (_) => const Right(true));
      } else {
        await _clearUserData();
        return const Right(false);
      }
    } catch (e) {
      await _clearUserData();
      return const Right(false);
    }
  }

  @override
  ResultFuture<User> userLogin({
    required String email,
    required String password,
  }) async {
    try {
      final user = await _remoteDataSource.login(
        email: email,
        password: password,
      );
      await _cachedUserData(user as UserModel);
      return Right(user);
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    }
  }

  @override
  ResultVoid userLogout() async {
    try {
      final userJson = _cachedDataSource.getString(_userCacheKey);
      if (userJson == null) {
        return const Right(null);
      }
      final user = UserModel.fromJson(userJson);
      await _remoteDataSource.logout(accessToken: user.accessToken);
      await _clearUserData();
      return const Right(null);
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    }
  }

  @override
  ResultFuture<User> userRegister({
    required String email,
    required String password,
    required String name,
    required String phone,
  }) async {
    try {
      final user = await _remoteDataSource.register(
        email: email,
        password: password,
        name: name,
        phone: phone,
      );
      await _cachedUserData(user as UserModel);
      return Right(user);
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    }
  }

  @override
  ResultVoid verifyOtp({required String email, required String otp}) async {
    try {
      await _remoteDataSource.verifyOtp(email: email, otp: otp);
      return const Right(null);
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    }
  }
}
