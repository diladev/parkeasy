import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/directions/domain/entities/map_app.dart';
import 'package:mobile/feature/directions/domain/repositories/directions_repository.dart';
import 'package:mobile/feature/directions/domain/usecases/open_directions.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/usecases/get_parking_lot_details.dart';

enum DirectionsStatus { loading, loaded, failure }

class DirectionsState extends Equatable {
  const DirectionsState({
    this.status = DirectionsStatus.loading,
    this.lot,
    this.apps = const [],
    this.errorMessage,
    this.errorSerial = 0,
  });

  final DirectionsStatus status;
  final ParkingLotDetails? lot;

  /// The map apps offered on this phone, the recommended one first.
  final List<MapApp> apps;
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  GeoPoint? get destination {
    final lot = this.lot;
    return lot == null ? null : GeoPoint(lot.latitude, lot.longitude);
  }

  DirectionsState copyWith({
    DirectionsStatus? status,
    ParkingLotDetails? lot,
    String? errorMessage,
    int? errorSerial,
  }) {
    return DirectionsState(
      status: status ?? this.status,
      lot: lot ?? this.lot,
      apps: apps,
      errorMessage: errorMessage ?? this.errorMessage,
      errorSerial: errorSerial ?? this.errorSerial,
    );
  }

  @override
  List<Object?> get props => [status, lot, apps, errorMessage, errorSerial];
}

/// "Get directions": the lot, and handing the route to a map app.
class DirectionsCubit extends Cubit<DirectionsState> {
  DirectionsCubit(this._getLot, this._openDirections, this._repository)
    : super(DirectionsState(apps: _repository.availableApps));

  final GetParkingLotDetails _getLot;
  final OpenDirections _openDirections;
  final DirectionsRepository _repository;

  Future<void> load(int lotId) async {
    emit(DirectionsState(apps: _repository.availableApps));

    final result = await _getLot(lotId);
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        state.copyWith(
          status: DirectionsStatus.failure,
          errorMessage: failure.message,
        ),
      ),
      (lot) => emit(state.copyWith(status: DirectionsStatus.loaded, lot: lot)),
    );
  }

  /// Opens [app]. False if it couldn't, so the screen can offer the
  /// coordinates instead.
  Future<bool> open(MapApp app) async {
    final lot = state.lot;
    final destination = state.destination;
    if (lot == null || destination == null) return false;

    final result = await _openDirections(
      OpenDirectionsParams(app: app, destination: destination, label: lot.name),
    );
    if (isClosed) return false;
    return result.fold((failure) {
      emit(
        state.copyWith(
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      );
      return false;
    }, (_) => true);
  }
}
