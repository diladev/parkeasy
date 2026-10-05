import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/feature/auth/data/models/auth_model.dart';
import 'package:mobile/feature/profile/data/models/user_model.dart';

abstract class AuthenticationRemoteDataSource {
  Future<(UserModel, AuthModel)> login({
    required String email,
    required String password,
  });
  Future<(UserModel, AuthModel)> register({
    required String email,
    required String password,
    required String name,
    required String phone,
  });
  Future<(UserModel, AuthModel)> refreshToken({required String refreshToken});
  Future<void> logout();
  Future<void> forgotPassword({required String email});
  Future<String> verifyOtp({required String email, required String otp});
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  });
}

class AuthenticationRemoteDataSourceImpl
    implements AuthenticationRemoteDataSource {
  final ApiClient _client;

  AuthenticationRemoteDataSourceImpl(this._client);

  @override
  Future<void> forgotPassword({required String email}) async {
    await _client.post(kForgotPassword, auth: false, body: {'email': email});
  }

  @override
  Future<(UserModel, AuthModel)> login({
    required String email,
    required String password,
  }) async {
    final response = await _client.post(
      kLogin,
      auth: false,
      body: {'email': email, 'password': password},
    );

    return _session(response);
  }

  @override
  Future<void> logout() async {
    await _client.post(kLogout);
  }

  @override
  Future<(UserModel, AuthModel)> refreshToken({
    required String refreshToken,
  }) async {
    final response = await _client.post(
      kRefreshToken,
      auth: false,
      headers: {'Cookie': 'refreshToken=$refreshToken'},
    );
    return _session(response);
  }

  @override
  Future<(UserModel, AuthModel)> register({
    required String email,
    required String password,
    required String name,
    required String phone,
  }) async {
    final response = await _client.post(
      kRegister,
      auth: false,
      body: {
        'email': email,
        'password': password,
        'name': name,
        'phone': phone,
      },
    );
    return _session(response);
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    await _client.post(
      kResetPassword,
      auth: false,
      body: {'token': token, 'new_password': newPassword},
    );
  }

  @override
  Future<String> verifyOtp({required String email, required String otp}) async {
    final response = await _client.post(
      kVerifyOtp,
      auth: false,
      body: {'email': email, 'otp': otp},
    );
    return response.data['token'] as String;
  }

  (UserModel, AuthModel) _session(ApiResponse response) {
    final cookie = response.headers['set-cookie'] ?? '';
    final match = RegExp(r'refreshToken=([^;,\s]+)').firstMatch(cookie);
    if (match == null) {
      throw APIException(
        message: 'Refresh token not found in response headers',
        statusCode: 500,
      );
    }

    final body = response.map;
    final user = UserModel.fromMap(body['user'] as Map<String, dynamic>);
    final auth = AuthModel.fromResponse(
      body,
      refreshToken: Uri.decodeComponent(match.group(1)!),
    );
    return (user, auth);
  }
}
