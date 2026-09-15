import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/entities/user_entity.dart';

abstract class AuthenticationRepository {
  const AuthenticationRepository();

  ResultFuture<User> userLogin({
    required String email,
    required String password,
  });

  ResultFuture<User> userRegister({
    required String email,
    required String password,
    required String name,
    required String phone,
  });

  ResultFuture<User> refreshUser();
  ResultFuture<bool> userAuthenticated();
  ResultVoid userLogout();

  ResultVoid forgotPassword({required String email});
  ResultVoid verifyOtp({required String email, required String otp});
  ResultVoid resetPassword({
    required String token,
    required String newPassword,
  });
}
