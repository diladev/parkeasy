import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/entities/auth_entity.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';

abstract class AuthenticationRepository {
  const AuthenticationRepository();

  ResultFuture<(User, Auth)> userLogin({
    required String email,
    required String password,
  });

  ResultFuture<(User, Auth)> userRegister({
    required String email,
    required String password,
    required String name,
    required String phone,
  });

  ResultFuture<(User, Auth)> refreshUser();
  ResultFuture<bool> userAuthenticated();
  ResultVoid userLogout();
  ResultVoid clearSession();
  ResultVoid forgotPassword({required String email});
  ResultFuture<String> verifyOtp({required String email, required String otp});
  ResultVoid resetPassword({
    required String token,
    required String newPassword,
  });
}
