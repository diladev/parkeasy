import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class GetVehicles extends UsecaseWithoutParams<List<Vehicle>> {
  const GetVehicles(this._repository);
  final ProfileRepository _repository;

  @override
  ResultFuture<List<Vehicle>> call() => _repository.getVehicles();
}
