import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class VerifyOtpWithParams extends Equatable {
  final String email;
  final String otp;

  const VerifyOtpWithParams({required this.email, required this.otp});

  @override
  List<Object?> get props => [email, otp];
}

class VerifyOtp extends UsecaseWithParams<String, VerifyOtpWithParams> {
  final AuthenticationRepository _repository;
  VerifyOtp(this._repository);

  @override
  ResultFuture<String> call(VerifyOtpWithParams params) async =>
      _repository.verifyOtp(email: params.email, otp: params.otp);
}
