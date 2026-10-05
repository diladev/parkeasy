import 'dart:convert';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/entities/auth_entity.dart';

class AuthModel extends Auth {
  const AuthModel({
    required super.accessToken,
    required super.accessTokenExpiresIn,
    required super.refreshToken,
    required super.refreshTokenExpiresIn,
  });

  factory AuthModel.fromResponse(DataMap body, {required String refreshToken}) {
    return AuthModel(
      accessToken: body['access_token'] as String,
      accessTokenExpiresIn: (body['expires_in'] as num).toInt(),
      refreshToken: refreshToken,
      refreshTokenExpiresIn: (body['refresh_token_expires_in'] as num).toInt(),
    );
  }

  factory AuthModel.fromMap(DataMap map) {
    return AuthModel(
      accessToken: map['accessToken'] as String,
      accessTokenExpiresIn: (map['accessTokenExpiresIn'] as num).toInt(),
      refreshToken: map['refreshToken'] as String,
      refreshTokenExpiresIn: (map['refreshTokenExpiresIn'] as num).toInt(),
    );
  }

  factory AuthModel.fromJson(String source) =>
      AuthModel.fromMap(jsonDecode(source) as DataMap);

  DataMap toMap() => {
    'accessToken': accessToken,
    'accessTokenExpiresIn': accessTokenExpiresIn,
    'refreshToken': refreshToken,
    'refreshTokenExpiresIn': refreshTokenExpiresIn,
  };

  String toJson() => jsonEncode(toMap());
}
