import 'dart:convert';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/entities/user_entity.dart';

class UserModel extends User {
  const UserModel({
    required super.name,
    required super.phone,
    required super.email,
    required super.accessToken,
    required super.accessTokenExpiration,
    required super.refreshToken,
    required super.refreshTokenExpiration,
  });

  UserModel.fromMap(DataMap map)
    : super(
        name: (map['user'] as Map<String, dynamic>)['name'] as String,
        phone: (map['user'] as Map<String, dynamic>)['phone'] as String,
        email: (map['user'] as Map<String, dynamic>)['email'] as String,
        accessToken:
            (map['token'] as Map<String, dynamic>)['access_token'] as String,
        accessTokenExpiration:
            (map['token'] as Map<String, dynamic>)['access_token_expiration']
                as String,
        refreshToken:
            (map['token'] as Map<String, dynamic>)['refresh_token'] as String,
        refreshTokenExpiration:
            (map['token'] as Map<String, dynamic>)['refresh_token_expiration']
                as String,
      );

  factory UserModel.fromJson(String source) =>
      UserModel.fromMap(jsonDecode(source) as DataMap);

  DataMap toMap() => {
    'user': {'name': name, 'phone': phone, 'email': email},
    'token': {
      'access_token': accessToken,
      'access_token_expiration': accessTokenExpiration,
      'refresh_token': refreshToken,
      'refresh_token_expiration': refreshTokenExpiration,
    },
  };

  String toJson() => jsonEncode(toMap());
}
