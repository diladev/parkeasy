import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/domain/usecases/delete_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/get_vehicles.dart';
import 'package:mobile/feature/profile/domain/usecases/set_default_vehicle.dart';
import 'vehicles_state.dart';

/// The My vehicles screen: the list, and setting a default or deleting one.
/// Adding and editing happen on the vehicle form screen.
class VehiclesCubit extends Cubit<VehiclesState> {
  VehiclesCubit(this._getVehicles, this._setDefaultVehicle, this._deleteVehicle)
    : super(const VehiclesState());

  final GetVehicles _getVehicles;
  final SetDefaultVehicle _setDefaultVehicle;
  final DeleteVehicle _deleteVehicle;

  Future<void> load() async {
    emit(state.copyWith(status: VehiclesStatus.loading));
    final result = await _getVehicles();
    result.fold(
      (failure) => emit(
        state.copyWith(
          status: VehiclesStatus.failure,
          errorMessage: failure.message,
        ),
      ),
      (vehicles) => emit(
        state.copyWith(status: VehiclesStatus.loaded, vehicles: vehicles),
      ),
    );
  }

  /// After the form screen added or edited [vehicle], reload so the order and
  /// the default flag match the server.
  Future<void> vehicleSaved(Vehicle vehicle) => load();

  Future<void> setDefault(Vehicle vehicle) async {
    if (vehicle.isDefault || state.busyVehicleId != null) return;
    emit(state.copyWith(busyVehicleId: () => vehicle.id));

    final result = await _setDefaultVehicle(
      SetDefaultVehicleParams(vehicleId: vehicle.id),
    );
    await result.fold(
      (failure) async => emit(
        state.copyWith(
          busyVehicleId: () => null,
          lastAction: VehicleActionResult(
            id: vehicle.id,
            message: failure.message,
            isError: true,
          ),
        ),
      ),
      (_) async {
        // Only one default: refresh the whole list from the server.
        final reloaded = await _getVehicles();
        emit(
          state.copyWith(
            busyVehicleId: () => null,
            vehicles: reloaded.getOrElse(() => state.vehicles),
            lastAction: VehicleActionResult(
              id: vehicle.id,
              message: '${vehicle.displayName} is now your default vehicle.',
              isError: false,
            ),
          ),
        );
      },
    );
  }

  Future<void> delete(Vehicle vehicle) async {
    if (state.busyVehicleId != null) return;
    emit(state.copyWith(busyVehicleId: () => vehicle.id));

    final result = await _deleteVehicle(DeleteVehicleParams(vehicleId: vehicle.id));
    await result.fold(
      (failure) async => emit(
        state.copyWith(
          busyVehicleId: () => null,
          lastAction: VehicleActionResult(
            id: vehicle.id,
            message: failure.message,
            isError: true,
          ),
        ),
      ),
      (_) async {
        // The server may have made another vehicle the default.
        final reloaded = await _getVehicles();
        emit(
          state.copyWith(
            busyVehicleId: () => null,
            vehicles: reloaded.getOrElse(
              () => state.vehicles.where((v) => v.id != vehicle.id).toList(),
            ),
            lastAction: VehicleActionResult(
              id: vehicle.id,
              message: '${vehicle.displayName} was removed.',
              isError: false,
            ),
          ),
        );
      },
    );
  }
}
