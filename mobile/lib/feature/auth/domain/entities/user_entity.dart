import 'package:equatable/equatable.dart';

class User extends Equatable {
  const User({
    required this.name,
    required this.phone,
    required this.email,
    required this.accessToken,
    required this.accessTokenExpiration,
    required this.refreshToken,
    required this.refreshTokenExpiration,
  });

  final String name;
  final String phone;
  final String email;
  final String accessToken;
  final String accessTokenExpiration;
  final String refreshToken;
  final String refreshTokenExpiration;

  @override
  List<Object?> get props => [email, accessToken, refreshToken];
}
