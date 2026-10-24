import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/entities/parking_slot.dart';
import 'package:mobile/feature/parking/domain/usecases/get_parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/usecases/set_favorite.dart';
import 'parking_details_state.dart';

/// The lot details screen: the lot, the level being shown and the slot the
/// user picked.
class ParkingDetailsCubit extends Cubit<ParkingDetailsState> {
  ParkingDetailsCubit(this._getLotDetails, this._setFavorite)
    : super(const ParkingDetailsState());

  final GetParkingLotDetails _getLotDetails;
  final SetFavorite _setFavorite;

  Future<void> load(int lotId) async {
    // Keep showing the lot while it refreshes.
    if (state.lot == null) emit(const ParkingDetailsState());

    final result = await _getLotDetails(lotId);
    result.fold(
      (failure) => emit(
        ParkingDetailsState(
          status: state.lot == null
              ? ParkingDetailsStatus.failure
              : ParkingDetailsStatus.loaded,
          lot: state.lot,
          level: state.level,
          selectedSlot: state.selectedSlot,
          isFavorite: state.isFavorite,
          errorMessage: failure.message,
        ),
      ),
      (lot) => emit(
        ParkingDetailsState(
          status: ParkingDetailsStatus.loaded,
          lot: lot,
          level: _levelToShow(lot),
          selectedSlot: _stillFree(lot, state.selectedSlot),
          isFavorite: lot.isFavorite,
        ),
      ),
    );
  }

  /// The heart: saves or removes the lot. It changes right away and changes
  /// back, with the reason, if the server refuses.
  Future<void> toggleFavorite() async {
    final lot = state.lot;
    if (lot == null) return;
    final wanted = !state.isFavorite;
    _setFavoriteShown(wanted);

    final result = await _setFavorite(
      SetFavoriteParams(lot.id, isFavorite: wanted),
    );
    if (isClosed) return;
    result.fold(
      (failure) => _setFavoriteShown(!wanted, errorMessage: failure.message),
      (_) {},
    );
  }

  void _setFavoriteShown(bool isFavorite, {String? errorMessage}) => emit(
    ParkingDetailsState(
      status: state.status,
      lot: state.lot,
      level: state.level,
      selectedSlot: state.selectedSlot,
      isFavorite: isFavorite,
      errorMessage: errorMessage,
    ),
  );

  void selectLevel(String level) {
    if (level == state.level) return;
    emit(
      ParkingDetailsState(
        status: state.status,
        lot: state.lot,
        level: level,
        // The selection stays, so the bar still shows it on another level.
        selectedSlot: state.selectedSlot,
        isFavorite: state.isFavorite,
      ),
    );
  }

  /// Picks a free slot; tapping the selected slot again clears it.
  void selectSlot(ParkingSlot slot) {
    if (!slot.isFree) return;
    emit(
      ParkingDetailsState(
        status: state.status,
        lot: state.lot,
        level: state.level,
        selectedSlot: slot == state.selectedSlot ? null : slot,
        isFavorite: state.isFavorite,
      ),
    );
  }

  /// The level already shown if it still exists, otherwise the first level
  /// with a free slot (or just the first level).
  String? _levelToShow(ParkingLotDetails lot) {
    final levels = lot.levels;
    if (levels.contains(state.level)) return state.level;
    for (final level in levels) {
      if (lot.slots.any((slot) => slot.level == level && slot.isFree)) {
        return level;
      }
    }
    return levels.isEmpty ? null : levels.first;
  }

  /// After a refresh, the selected slot only stays if nobody booked it meanwhile.
  static ParkingSlot? _stillFree(ParkingLotDetails lot, ParkingSlot? selected) {
    if (selected == null) return null;
    for (final slot in lot.slots) {
      if (slot.id == selected.id) return slot.isFree ? slot : null;
    }
    return null;
  }
}
