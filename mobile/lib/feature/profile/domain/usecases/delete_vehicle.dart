import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class DeleteVehicle extends UsecaseWithParams<void, DeleteVehicleParams> {
  const DeleteVehicle(this._repository);
  final ProfileRepository _repository;

  @override
  ResultVoid call(DeleteVehicleParams params) =>
      _repository.deleteVehicle(vehicleId: params.vehicleId);
}

class DeleteVehicleParams extends Equatable {
  const DeleteVehicleParams({required this.vehicleId});
  final int vehicleId;

  @override
  List<Object?> get props => [vehicleId];
}
