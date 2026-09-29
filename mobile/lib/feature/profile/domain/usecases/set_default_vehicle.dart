import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class SetDefaultVehicle
    extends UsecaseWithParams<void, SetDefaultVehicleParams> {
  const SetDefaultVehicle(this._repository);
  final ProfileRepository _repository;

  @override
  ResultVoid call(SetDefaultVehicleParams params) =>
      _repository.setDefaultVehicle(vehicleId: params.vehicleId);
}

class SetDefaultVehicleParams extends Equatable {
  const SetDefaultVehicleParams({required this.vehicleId});
  final int vehicleId;

  @override
  List<Object?> get props => [vehicleId];
}
