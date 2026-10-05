import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

class VehicleModel extends Vehicle {
  const VehicleModel({
    required super.id,
    required super.brand,
    required super.model,
    required super.year,
    required super.color,
    required super.plateNumber,
    required super.type,
    required super.isDefault,
  });

  factory VehicleModel.fromMap(DataMap map) {
    return VehicleModel(
      id: (map['id'] as num).toInt(),
      brand: map['brand'] as String,
      model: map['model'] as String,
      year: (map['year'] as num).toInt(),
      color: map['color'] as String,
      plateNumber: map['plate_number'] as String,
      type: VehicleType.fromApi(map['type'] as String?),
      isDefault: map['is_default'] == true || map['is_default'] == 1,
    );
  }

  DataMap toMap() {
    return {
      'id': id,
      'brand': brand,
      'model': model,
      'year': year,
      'color': color,
      'plate_number': plateNumber,
      'type': type.apiValue,
      'is_default': isDefault,
    };
  }
}
