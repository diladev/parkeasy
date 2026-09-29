import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class GetVehicles extends UsecaseWithoutParams<List<VehicleEntity>> {
  const GetVehicles(this._repository);
  final ProfileRepository _repository;

  @override
  ResultFuture<List<VehicleEntity>> call() => _repository.getVehicles();
}
