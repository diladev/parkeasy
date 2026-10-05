import 'package:equatable/equatable.dart';

class User extends Equatable {
  const User({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    required this.phone,
    this.dateOfBirth,
  });

  final int id;
  final String name;
  final String username;
  final String email;
  final String phone;
  final DateTime? dateOfBirth;

  @override
  List<Object?> get props => [id, name, username, email, phone, dateOfBirth];
}
