import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

abstract class ProfileRepository {
  const ProfileRepository();

  User? getCachedProfile();

  ResultFuture<User> getProfile();

  ResultFuture<User> updateProfile({
    required String name,
    required String email,
    required String phone,
    DateTime? dateOfBirth,
  });

  ResultVoid changePassword({
    required String currentPassword,
    required String newPassword,
  });

  ResultVoid deleteAccount({required String password});

  ResultFuture<List<Vehicle>> getVehicles();

  ResultFuture<Vehicle> addVehicle({
    required String brand,
    required String model,
    required int year,
    required String color,
    required String plateNumber,
    required VehicleType type,
  });

  ResultFuture<Vehicle> updateVehicle({
    required int vehicleId,
    required String brand,
    required String model,
    required int year,
    required String color,
    required String plateNumber,
    required VehicleType type,
  });

  ResultVoid deleteVehicle({required int vehicleId});

  ResultFuture<Vehicle> setDefaultVehicle({required int vehicleId});
}
