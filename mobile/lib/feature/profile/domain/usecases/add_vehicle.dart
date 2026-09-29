import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class AddVehicle extends UsecaseWithParams<void, AddVehicleParams> {
  const AddVehicle(this._repository);
  final ProfileRepository _repository;

  @override
  ResultVoid call(AddVehicleParams params) => _repository.addVehicle(
    brand: params.brand,
    model: params.model,
    year: params.year,
    color: params.color,
    plateNumber: params.plateNumber,
  );
}

class AddVehicleParams extends Equatable {
  const AddVehicleParams({
    required this.brand,
    required this.model,
    required this.year,
    required this.color,
    required this.plateNumber,
  });

  final String brand;
  final String model;
  final int year;
  final String color;
  final String plateNumber;

  @override
  List<Object?> get props => [brand, model, year, color, plateNumber];
}
