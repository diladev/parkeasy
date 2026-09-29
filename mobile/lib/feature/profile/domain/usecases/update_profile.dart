import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class UpdateProfile extends UsecaseWithParams<void, UpdateProfileParams> {
  const UpdateProfile(this._repository);
  final ProfileRepository _repository;

  @override
  ResultVoid call(UpdateProfileParams params) => _repository.updateProfile(
    name: params.name,
    email: params.email,
    phone: params.phone,
    dateOfBirth: params.dateOfBirth,
  );
}

class UpdateProfileParams extends Equatable {
  const UpdateProfileParams({
    this.name,
    this.email,
    this.phone,
    this.dateOfBirth,
  });

  final String? name;
  final String? email;
  final String? phone;
  final String? dateOfBirth;

  @override
  List<Object?> get props => [name, email, phone, dateOfBirth];
}
