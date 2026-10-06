import 'package:equatable/equatable.dart';

enum VehicleType {
  sedan('Sedan'),
  suv('SUV'),
  truck('Truck');

  const VehicleType(this.label);
  final String label;

  String get apiValue => name;

  static VehicleType fromApi(String? value) => VehicleType.values.firstWhere(
    (type) => type.name == value,
    orElse: () => VehicleType.sedan,
  );
}

class Vehicle extends Equatable {
  const Vehicle({
    required this.id,
    required this.brand,
    required this.model,
    required this.year,
    required this.color,
    required this.plateNumber,
    required this.type,
    required this.isDefault,
  });

  final int id;
  final String brand;
  final String model;
  final int year;
  final String color;
  final String plateNumber;
  final VehicleType type;
  final bool isDefault;

  String get displayName => '$brand $model';

  @override
  List<Object?> get props => [
    id,
    brand,
    model,
    year,
    color,
    plateNumber,
    type,
    isDefault,
  ];
}
