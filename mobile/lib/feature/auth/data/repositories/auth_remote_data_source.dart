import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/feature/auth/data/models/user_model.dart';
import 'package:mobile/feature/auth/domain/entities/user_entity.dart';

abstract class AuthenticationRemoteDataSource {
  Future<User> login({required String email, required String password});
  Future<User> register({
    required String email,
    required String password,
    required String name,
    required String phone,
  });
  Future<User> refreshToken({required String refreshToken});
  Future<void> logout({required String accessToken});
  Future<void> forgotPassword({required String email});
  Future<void> verifyOtp({required String email, required String otp});
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  });
}

class AuthenticationRemoteDataSourceImpl
    implements AuthenticationRemoteDataSource {
  final http.Client _client;

  AuthenticationRemoteDataSourceImpl(this._client);

  @override
  Future<void> forgotPassword({required String email}) async {
    try {
      final response = await _client.post(
        Uri.parse(kForgotPassword),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw APIException(
          message: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      throw APIException(message: e.toString(), statusCode: 505);
    }
  }

  @override
  Future<User> login({required String email, required String password}) async {
    try {
      final response = await _client.post(
        Uri.parse(kLogin),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );
      if (response.statusCode == 200) {
        return UserModel.fromJson(response.body);
      } else {
        throw APIException(
          message: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      throw APIException(message: e.toString(), statusCode: 500);
    }
  }

  @override
  Future<void> logout({required String accessToken}) async {
    try {
      final response = await _client.post(
        Uri.parse(kLogout),
        headers: {
          'Authorization': 'Bearer $accessToken',
          'Content-Type': 'application/json',
        },
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw APIException(
          message: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      throw APIException(message: e.toString(), statusCode: 505);
    }
  }

  @override
  Future<User> refreshToken({required String refreshToken}) async {
    try {
      final response = await _client.post(
        Uri.parse(kRefreshToken),
        headers: {
          'Authorization': 'Bearer $refreshToken',
          'Content-Type': 'application/json',
        },
      );
      if (response.statusCode == 200) {
        return UserModel.fromMap(jsonDecode(response.body));
      } else {
        throw APIException(
          message: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      throw APIException(message: e.toString(), statusCode: 505);
    }
  }

  @override
  Future<User> register({
    required String email,
    required String password,
    required String name,
    required String phone,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse(kRegister),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'password': password,
          'name': name,
          'phone': phone,
        }),
      );
      if (response.statusCode == 200 && response.statusCode == 201) {
        return UserModel.fromMap(jsonDecode(response.body));
      } else {
        throw APIException(
          message: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      throw APIException(message: e.toString(), statusCode: 505);
    }
  }

  @override
  Future<void> resetPassword({
    required String token,
    required String newPassword,
  }) async {
    try {
      final response = await _client.post(
        Uri.parse(kResetPassword),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'token': token, 'new_password': newPassword}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw APIException(
          message: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      throw APIException(message: e.toString(), statusCode: 505);
    }
  }

  @override
  Future<void> verifyOtp({required String email, required String otp}) async {
    try {
      final response = await _client.post(
        Uri.parse(kVerifyOtp),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'otp': otp}),
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw APIException(
          message: response.body,
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      throw APIException(message: e.toString(), statusCode: 505);
    }
  }
}
