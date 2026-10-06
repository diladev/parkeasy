import 'package:equatable/equatable.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

enum VehiclesStatus { loading, loaded, failure }

/// The result of the last action on one vehicle (set default, delete), for
/// the snackbar. [serial] is new for every action, so the screen hears each
/// one, even two identical errors in a row.
class VehicleActionResult extends Equatable {
  VehicleActionResult({
    required this.id,
    required this.message,
    required this.isError,
  }) : serial = DateTime.now().microsecondsSinceEpoch;

  final int id;
  final String message;
  final bool isError;
  final int serial;

  @override
  List<Object?> get props => [id, message, isError, serial];
}

class VehiclesState extends Equatable {
  const VehiclesState({
    this.status = VehiclesStatus.loading,
    this.vehicles = const [],
    this.busyVehicleId,
    this.errorMessage,
    this.lastAction,
  });

  final VehiclesStatus status;
  final List<Vehicle> vehicles;

  /// The vehicle being changed right now (its row shows a spinner).
  final int? busyVehicleId;

  /// Why the list couldn't be loaded.
  final String? errorMessage;

  final VehicleActionResult? lastAction;

  VehiclesState copyWith({
    VehiclesStatus? status,
    List<Vehicle>? vehicles,
    int? Function()? busyVehicleId,
    String? errorMessage,
    VehicleActionResult? lastAction,
  }) {
    return VehiclesState(
      status: status ?? this.status,
      vehicles: vehicles ?? this.vehicles,
      // A function so the caller can set it back to null.
      busyVehicleId: busyVehicleId != null ? busyVehicleId() : this.busyVehicleId,
      errorMessage: errorMessage,
      lastAction: lastAction ?? this.lastAction,
    );
  }

  @override
  List<Object?> get props => [
    status,
    vehicles,
    busyVehicleId,
    errorMessage,
    lastAction,
  ];
}
