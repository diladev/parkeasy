import 'package:equatable/equatable.dart';

class VehicleEntity extends Equatable {
  const VehicleEntity({
    required this.brand,
    required this.model,
    required this.year,
    required this.color,
    required this.plateNumber,
    required this.isDefault,
  });

  final String brand;
  final String model;
  final int year;
  final String color;
  final String plateNumber;
  final bool isDefault;

  @override
  List<Object?> get props => [
    brand,
    model,
    year,
    color,
    plateNumber,
    isDefault,
  ];
}
