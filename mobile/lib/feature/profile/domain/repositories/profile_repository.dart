import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

abstract class ProfileRepository {
  const ProfileRepository();

  ResultFuture<UserEntity> getProfile();

  ResultVoid updateProfile({
    String? name,
    String? email,
    String? phone,
    String? dateOfBirth,
  });

  ResultVoid changePassword({required String password});

  ResultVoid addVehicle({
    required String brand,
    required String model,
    required int year,
    required String color,
    required String plateNumber,
  });

  ResultFuture<List<VehicleEntity>> getVehicles();

  ResultVoid deleteVehicle({required int vehicleId});

  ResultVoid setDefaultVehicle({required int vehicleId});
}
