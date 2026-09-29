import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/entities/user_entity.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class UserRegisterWithParams extends Equatable {
  final String email;
  final String password;
  final String name;
  final String phone;

  const UserRegisterWithParams({
    required this.email,
    required this.password,
    required this.name,
    required this.phone,
  });

  @override
  List<Object?> get props => [email, password, name, phone];
}

class UserRegister extends UsecaseWithParams<User, UserRegisterWithParams> {
  final AuthenticationRepository _repository;
  UserRegister(this._repository);

  @override
  ResultFuture<User> call(UserRegisterWithParams params) async =>
      _repository.userRegister(
        email: params.email,
        password: params.password,
        name: params.name,
        phone: params.phone,
      );
}
