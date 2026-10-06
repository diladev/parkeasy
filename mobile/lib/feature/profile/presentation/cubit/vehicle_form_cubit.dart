import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/state/submit_state.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/domain/usecases/add_vehicle.dart';
import 'package:mobile/feature/profile/domain/usecases/update_vehicle.dart';

/// Belongs to the add / edit vehicle screen only.
class VehicleFormCubit extends Cubit<SubmitState<Vehicle>> {
  VehicleFormCubit(this._addVehicle, this._updateVehicle)
    : super(const SubmitState());

  final AddVehicle _addVehicle;
  final UpdateVehicle _updateVehicle;

  /// Adds a vehicle, or updates [vehicleId] when it's given.
  Future<void> submit({
    int? vehicleId,
    required String brand,
    required String model,
    required int year,
    required String color,
    required String plateNumber,
    required VehicleType type,
  }) async {
    if (state.isSubmitting) return;
    emit(const SubmitState(status: SubmitStatus.submitting));

    final result = vehicleId == null
        ? await _addVehicle(
            AddVehicleParams(
              brand: brand,
              model: model,
              year: year,
              color: color,
              plateNumber: plateNumber,
              type: type,
            ),
          )
        : await _updateVehicle(
            UpdateVehicleParams(
              vehicleId: vehicleId,
              brand: brand,
              model: model,
              year: year,
              color: color,
              plateNumber: plateNumber,
              type: type,
            ),
          );

    result.fold(
      (failure) => emit(
        SubmitState(status: SubmitStatus.failure, message: failure.message),
      ),
      (vehicle) => emit(SubmitState(status: SubmitStatus.success, data: vehicle)),
    );
  }
}
