import 'dart:convert';

import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';

class UserModel extends User {
  const UserModel({
    required super.id,
    required super.name,
    required super.username,
    required super.email,
    required super.phone,
    super.dateOfBirth,
  });

  const UserModel.empty()
    : this(id: 0, name: '', username: '', email: '', phone: '');

  factory UserModel.fromMap(DataMap map) {
    return UserModel(
      id: (map['id'] as num).toInt(),
      name: map['name'] as String,
      username: map['username'] as String,
      email: map['email'] as String,
      phone: map['phone'] as String,
      dateOfBirth: map['date_of_birth'] == null
          ? null
          : DateTime.tryParse(map['date_of_birth'] as String),
    );
  }

  factory UserModel.fromJson(String source) {
    return UserModel.fromMap(jsonDecode(source) as DataMap);
  }

  static DateTime? _parseDate(String? date) {
    if (date is! String || date.isEmpty) return null;
    final parsedDate = DateTime.tryParse(date);
    return parsedDate == null
        ? null
        : DateTime(parsedDate.year, parsedDate.month, parsedDate.day);
  }

  DataMap toMap() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'phone': phone,
      'date_of_birth': dateOfBirth == null
          ? null
          : Formatters.apiDate(dateOfBirth!),
    };
  }

  String toJson() {
    return jsonEncode(toMap());
  }
}
