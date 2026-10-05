import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/data/models/user_model.dart';
import 'package:mobile/feature/profile/data/models/vehicle_model.dart';

abstract class ProfileRemoteDataSource {
  Future<UserModel> getProfile();

  Future<UserModel> updateProfile(DataMap changes);

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  });

  Future<void> deleteAccount({required String password});

  Future<List<VehicleModel>> getVehicles();

  Future<VehicleModel> addVehicle(DataMap vehicle);

  Future<VehicleModel> updateVehicle(int vehicleId, DataMap vehicle);

  Future<void> deleteVehicle(int vehicleId);

  Future<VehicleModel> setDefaultVehicle(int vehicleId);
}

class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  ProfileRemoteDataSourceImpl(this._api);

  final ApiClient _api;

  @override
  Future<UserModel> getProfile() async {
    final response = await _api.get(kProfile);
    return UserModel.fromMap(response.map);
  }

  @override
  Future<UserModel> updateProfile(DataMap changes) async {
    final response = await _api.patch(kProfile, body: changes);
    return UserModel.fromMap(response.map['user'] as DataMap);
  }

  @override
  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _api.patch(
      kChangePassword,
      body: {'old_password': currentPassword, 'new_password': newPassword},
    );
  }

  @override
  Future<void> deleteAccount({required String password}) async {
    await _api.delete(kProfile, body: {'password': password});
  }

  @override
  Future<List<VehicleModel>> getVehicles() async {
    final response = await _api.get(kVehicles);
    return response.list
        .map((item) => VehicleModel.fromMap(item as DataMap))
        .toList();
  }

  @override
  Future<VehicleModel> addVehicle(DataMap vehicle) async {
    final response = await _api.post(kVehicles, body: vehicle);
    return VehicleModel.fromMap(response.map['vehicle'] as DataMap);
  }

  @override
  Future<VehicleModel> updateVehicle(int vehicleId, DataMap vehicle) async {
    final response = await _api.patch('$kVehicles/$vehicleId', body: vehicle);
    return VehicleModel.fromMap(response.map['vehicle'] as DataMap);
  }

  @override
  Future<void> deleteVehicle(int vehicleId) async {
    await _api.delete('$kVehicles/$vehicleId');
  }

  @override
  Future<VehicleModel> setDefaultVehicle(int vehicleId) async {
    final response = await _api.patch('$kVehicles/$vehicleId/default');
    return VehicleModel.fromMap(response.map['vehicle'] as DataMap);
  }
}
