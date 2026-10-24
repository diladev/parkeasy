import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/domain/usecases/get_favorite_lots.dart';
import 'package:mobile/feature/parking/domain/usecases/set_favorite.dart';

enum FavoritesStatus { loading, loaded, failure }

class FavoritesState extends Equatable {
  const FavoritesState({
    this.status = FavoritesStatus.loading,
    this.lots = const [],
    this.errorMessage,
    this.errorSerial = 0,
  });

  final FavoritesStatus status;

  /// Last saved first.
  final List<ParkingLotSummary> lots;
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  FavoritesState copyWith({
    FavoritesStatus? status,
    List<ParkingLotSummary>? lots,
    String? errorMessage,
    int? errorSerial,
  }) {
    return FavoritesState(
      status: status ?? this.status,
      lots: lots ?? this.lots,
      errorMessage: errorMessage ?? this.errorMessage,
      errorSerial: errorSerial ?? this.errorSerial,
    );
  }

  @override
  List<Object?> get props => [status, lots, errorMessage, errorSerial];
}

/// The saved lots. Removing one hides it right away and puts it back if
/// the server refuses.
class FavoritesCubit extends Cubit<FavoritesState> {
  FavoritesCubit(this._getFavorites, this._setFavorite)
    : super(const FavoritesState());

  final GetFavoriteLots _getFavorites;
  final SetFavorite _setFavorite;

  Future<void> load() async {
    final hasLots = state.status == FavoritesStatus.loaded;
    if (!hasLots) emit(state.copyWith(status: FavoritesStatus.loading));

    final result = await _getFavorites();
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        state.copyWith(
          status: hasLots ? FavoritesStatus.loaded : FavoritesStatus.failure,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (lots) =>
          emit(state.copyWith(status: FavoritesStatus.loaded, lots: lots)),
    );
  }

  Future<void> remove(ParkingLotSummary lot) async {
    final before = state.lots;
    emit(state.copyWith(lots: [for (final l in before) if (l.id != lot.id) l]));

    final result = await _setFavorite(
      SetFavoriteParams(lot.id, isFavorite: false),
    );
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        state.copyWith(
          lots: before,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (_) {},
    );
  }

  /// "Undo" after a removal.
  Future<void> restore(ParkingLotSummary lot) async {
    final result = await _setFavorite(
      SetFavoriteParams(lot.id, isFavorite: true),
    );
    if (isClosed) return;
    result.fold(
      (failure) => emit(
        state.copyWith(
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (_) => load(),
    );
  }
}
