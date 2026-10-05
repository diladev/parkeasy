import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class UpdateVehicle extends UsecaseWithParams<Vehicle, UpdateVehicleParams> {
  const UpdateVehicle(this._repository);
  final ProfileRepository _repository;

  @override
  ResultFuture<Vehicle> call(UpdateVehicleParams params) =>
      _repository.updateVehicle(
        vehicleId: params.vehicleId,
        brand: params.brand,
        model: params.model,
        year: params.year,
        color: params.color,
        plateNumber: params.plateNumber,
        type: params.type,
      );
}

class UpdateVehicleParams extends Equatable {
  const UpdateVehicleParams({
    required this.vehicleId,
    required this.brand,
    required this.model,
    required this.year,
    required this.color,
    required this.plateNumber,
    required this.type,
  });

  final int vehicleId;
  final String brand;
  final String model;
  final int year;
  final String color;
  final String plateNumber;
  final VehicleType type;

  @override
  List<Object?> get props => [
    vehicleId,
    brand,
    model,
    year,
    color,
    plateNumber,
    type,
  ];
}
