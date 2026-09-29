import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  const UserEntity({
    required this.name,
    required this.username,
    required this.email,
    required this.phone,
    this.dateOfBirth,
  });

  final String name;
  final String username;
  final String email;
  final String phone;
  final DateTime? dateOfBirth;

  @override
  List<Object?> get props => [name, username, email, phone, dateOfBirth];
}
