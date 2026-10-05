import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class GetProfile extends UsecaseWithoutParams<User> {
  const GetProfile(this._repository);
  final ProfileRepository _repository;

  @override
  ResultFuture<User> call() => _repository.getProfile();

  User? cached() => _repository.getCachedProfile();
}
