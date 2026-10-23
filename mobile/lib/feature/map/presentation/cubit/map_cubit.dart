import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/domain/usecases/search_parking_lots.dart';
import 'map_state.dart';

/// The Map tab: every lot, which one is selected, and the order by distance
/// once the user's location is known (the screen passes it in from its
/// LocationCubit, so neither cubit knows about the other).
class MapCubit extends Cubit<MapState> {
  MapCubit(this._searchLots) : super(const MapState());

  final SearchParkingLots _searchLots;

  /// What the server sent, kept to re-order when the location changes.
  List<ParkingLotSummary> _lots = const [];

  Future<void> load() async {
    if (state.lots.isEmpty) {
      emit(
        MapState(
          userLocation: state.userLocation,
          selectedLotId: state.selectedLotId,
        ),
      );
    }

    // An empty search lists every lot in town (fewer than the API's page).
    final result = await _searchLots('');
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        MapState(
          status: state.lots.isEmpty ? MapStatus.failure : MapStatus.loaded,
          lots: state.lots,
          userLocation: state.userLocation,
          selectedLotId: state.selectedLotId,
          errorMessage: failure.message,
        ),
      ),
      (lots) {
        _lots = lots;
        _emitLoaded();
      },
    );
  }

  void userLocationChanged(GeoPoint? location) {
    if (location == state.userLocation) return;
    _emitLoaded(userLocation: location);
  }

  /// Null to close the callout.
  void select(int? lotId) {
    if (lotId == state.selectedLotId) return;
    emit(
      MapState(
        status: state.status,
        lots: state.lots,
        userLocation: state.userLocation,
        selectedLotId: lotId,
        errorMessage: state.errorMessage,
      ),
    );
  }

  void _emitLoaded({GeoPoint? userLocation}) {
    final user = userLocation ?? state.userLocation;
    emit(
      MapState(
        status: MapStatus.loaded,
        lots: orderLots(_lots, user),
        userLocation: user,
        selectedLotId: state.selectedLotId,
      ),
    );
  }
}
