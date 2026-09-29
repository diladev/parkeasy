import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/entities/user_entity.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class UserLoginWithParams extends Equatable {
  final String email;
  final String password;

  const UserLoginWithParams({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class UserLogin extends UsecaseWithParams<User, UserLoginWithParams> {
  final AuthenticationRepository _repository;
  UserLogin(this._repository);

  @override
  ResultFuture<User> call(UserLoginWithParams params) async =>
      _repository.userLogin(email: params.email, password: params.password);

  Future<bool> checkAuthStatus() async {
    final result = await _repository.userAuthenticated();
    return result.fold((_) => false, (isAuthenticated) => isAuthenticated);
  }
}
