import 'dart:async';

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/constants/default_location.dart';
import 'package:mobile/core/utils/geo.dart';
import 'package:mobile/feature/parking/domain/usecases/search_parking_lots.dart';
import 'search_state.dart';

/// The search screen: searches as the user types, then the chips and the
/// Filters sheet narrow and sort what was found.
class SearchCubit extends Cubit<SearchState> {
  SearchCubit(this._searchLots, {String initialQuery = ''})
    : super(SearchState(query: initialQuery.trim()));

  final SearchParkingLots _searchLots;

  /// Waits for a pause in typing before searching.
  static const Duration _typingPause = Duration(milliseconds: 400);

  Timer? _debounce;

  /// Only the newest search may update the screen: an older, slower answer
  /// must not replace it.
  int _latestSearch = 0;

  Future<void> search() async {
    _debounce?.cancel();
    final searchId = ++_latestSearch;
    emit(state.copyWith(status: SearchStatus.loading, errorMessage: () => null));

    final result = await _searchLots(state.query);
    if (isClosed || searchId != _latestSearch) return;

    result.fold(
      (failure) => emit(
        state.copyWith(
          status: SearchStatus.failure,
          errorMessage: () => failure.message,
        ),
      ),
      (lots) => emit(
        state.copyWith(
          status: SearchStatus.loaded,
          found: [
            for (final lot in lots)
              SearchResult(
                lot: lot,
                distanceKm: distanceKm(
                  DefaultLocation.latitude,
                  DefaultLocation.longitude,
                  lot.latitude,
                  lot.longitude,
                ),
              ),
          ],
        ),
      ),
    );
  }

  void queryChanged(String text) {
    final query = text.trim();
    if (query == state.query) return;
    emit(state.copyWith(query: query));
    _debounce?.cancel();
    _debounce = Timer(_typingPause, search);
  }

  void sortBy(SearchSort sort) =>
      emit(state.copyWith(filters: state.filters.copyWith(sort: sort)));

  /// A quick chip under the search box.
  void toggleAmenity(Amenity amenity) =>
      emit(state.copyWith(filters: state.filters.toggle(amenity)));

  /// Everything chosen in the Filters sheet at once.
  void applyFilters(SearchFilters filters) =>
      emit(state.copyWith(filters: filters));

  @override
  Future<void> close() {
    _debounce?.cancel();
    return super.close();
  }
}
