import 'package:equatable/equatable.dart';
import 'package:mobile/core/l10n/l10n.dart';

enum VehicleType {
  sedan,
  suv,
  truck;

  String get label => switch (this) {
    VehicleType.sedan => l10n.vehicleSedan,
    VehicleType.suv => l10n.vehicleSuv,
    VehicleType.truck => l10n.vehicleTruck,
  };

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
