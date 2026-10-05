import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/data/repositories/profile_local_data_source.dart';
import 'package:mobile/feature/profile/data/repositories/profile_remote_data_source.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  ProfileRepositoryImpl(this._remoteDataSource, this._localDataSource);

  final ProfileRemoteDataSource _remoteDataSource;
  final ProfileLocalDataSource _localDataSource;

  @override
  User? getCachedProfile() => _localDataSource.getUser();

  @override
  ResultFuture<User> getProfile() {
    return _guard(() async {
      final user = await _remoteDataSource.getProfile();
      await _localDataSource.saveUser(user);
      return user;
    });
  }

  @override
  ResultFuture<User> updateProfile({
    required String name,
    required String email,
    required String phone,
    DateTime? dateOfBirth,
  }) {
    return _guard(() async {
      final user = await _remoteDataSource.updateProfile({
        'name': name,
        'email': email,
        'phone': phone,
        'date_of_birth': dateOfBirth == null
            ? null
            : Formatters.apiDate(dateOfBirth),
      });
      await _localDataSource.saveUser(user);
      return user;
    });
  }

  @override
  ResultVoid changePassword({
    required String currentPassword,
    required String newPassword,
  }) {
    return _guard(
      () => _remoteDataSource.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      ),
    );
  }

  @override
  ResultVoid deleteAccount({required String password}) {
    return _guard(() => _remoteDataSource.deleteAccount(password: password));
  }

  @override
  ResultFuture<List<Vehicle>> getVehicles() {
    return _guard(() => _remoteDataSource.getVehicles());
  }

  @override
  ResultFuture<Vehicle> addVehicle({
    required String brand,
    required String model,
    required int year,
    required String color,
    required String plateNumber,
    required VehicleType type,
  }) {
    return _guard(
      () => _remoteDataSource.addVehicle(
        _vehicleBody(brand, model, year, color, plateNumber, type),
      ),
    );
  }

  @override
  ResultFuture<Vehicle> updateVehicle({
    required int vehicleId,
    required String brand,
    required String model,
    required int year,
    required String color,
    required String plateNumber,
    required VehicleType type,
  }) {
    return _guard(
      () => _remoteDataSource.updateVehicle(
        vehicleId,
        _vehicleBody(brand, model, year, color, plateNumber, type),
      ),
    );
  }

  @override
  ResultVoid deleteVehicle({required int vehicleId}) {
    return _guard(() => _remoteDataSource.deleteVehicle(vehicleId));
  }

  @override
  ResultFuture<Vehicle> setDefaultVehicle({required int vehicleId}) {
    return _guard(() => _remoteDataSource.setDefaultVehicle(vehicleId));
  }

  DataMap _vehicleBody(
    String brand,
    String model,
    int year,
    String color,
    String plateNumber,
    VehicleType type,
  ) {
    return {
      'brand': brand,
      'model': model,
      'year': year,
      'color': color,
      'license_plate': plateNumber,
      'type': type.apiValue,
    };
  }

  ResultFuture<T> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    } catch (_) {
      return const Left(
        APIFailure(
          message: 'Something went wrong. Please try again.',
          statusCode: 500,
        ),
      );
    }
  }
}
