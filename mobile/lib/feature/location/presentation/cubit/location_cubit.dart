import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/location/domain/entities/location_failure.dart';
import 'package:mobile/feature/location/domain/repositories/location_repository.dart';
import 'package:mobile/feature/location/domain/usecases/get_current_location.dart';

enum LocationStatus { unknown, locating, ready, unavailable }

class LocationState extends Equatable {
  const LocationState({
    this.status = LocationStatus.unknown,
    this.point,
    this.problem,
  });

  final LocationStatus status;

  /// Where the phone is; kept while a new fix is being found.
  final GeoPoint? point;

  /// Why there's no location, when [status] is unavailable.
  final LocationProblem? problem;

  @override
  List<Object?> get props => [status, point, problem];
}

/// The phone's location for one screen. The screen works without it.
class LocationCubit extends Cubit<LocationState> {
  LocationCubit(this._getCurrentLocation, this._repository)
    : super(const LocationState());

  final GetCurrentLocation _getCurrentLocation;
  final LocationRepository _repository;

  /// Finds the phone. Without [askPermission] it stays quiet, using the
  /// location only if it's already allowed (e.g. when a screen opens).
  Future<void> locate({bool askPermission = false}) async {
    if (state.status == LocationStatus.locating) return;
    emit(
      LocationState(
        status: LocationStatus.locating,
        point: state.point,
        problem: state.problem,
      ),
    );

    final result = await _getCurrentLocation(askPermission);
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        LocationState(
          // A new fix failed but an older one is still useful.
          status: state.point != null
              ? LocationStatus.ready
              : LocationStatus.unavailable,
          point: state.point,
          problem: failure is LocationFailure
              ? failure.problem
              : LocationProblem.unknown,
        ),
      ),
      (point) =>
          emit(LocationState(status: LocationStatus.ready, point: point)),
    );
  }

  /// What the "location is off" banner's button does for each problem.
  Future<void> fix() async {
    switch (state.problem) {
      case LocationProblem.serviceDisabled:
        await _repository.openLocationSettings();
      case LocationProblem.permissionDeniedForever:
        await _repository.openAppSettings();
      case LocationProblem.permissionDenied:
      case LocationProblem.timeout:
      case LocationProblem.unknown:
      case null:
        await locate(askPermission: true);
    }
  }
}
