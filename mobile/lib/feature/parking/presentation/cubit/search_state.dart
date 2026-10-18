import 'package:equatable/equatable.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

enum SearchStatus { loading, loaded, failure }

/// How the results are ordered.
enum SearchSort { nearest, price }

/// A lot in the results with its distance from the user.
class SearchResult extends Equatable {
  const SearchResult({required this.lot, required this.distanceKm});

  final ParkingLotSummary lot;
  final double distanceKm;

  @override
  List<Object?> get props => [lot, distanceKm];
}

class SearchState extends Equatable {
  const SearchState({
    this.query = '',
    this.status = SearchStatus.loading,
    this.found = const [],
    this.sort = SearchSort.nearest,
    this.evOnly = false,
    this.coveredOnly = false,
    this.errorMessage,
  });

  final String query;
  final SearchStatus status;

  /// Everything the server found, before the chips filter and sort it.
  final List<SearchResult> found;

  final SearchSort sort;
  final bool evOnly;
  final bool coveredOnly;
  final String? errorMessage;

  /// What the list shows: [found], filtered and sorted by the chips.
  List<SearchResult> get results {
    final shown = found
        .where((result) => !evOnly || result.lot.hasEvCharging)
        .where((result) => !coveredOnly || result.lot.isCovered)
        .toList();
    shown.sort(
      (a, b) => switch (sort) {
        SearchSort.nearest => a.distanceKm.compareTo(b.distanceKm),
        SearchSort.price => a.lot.pricePerHour.compareTo(b.lot.pricePerHour),
      },
    );
    return shown;
  }

  SearchState copyWith({
    String? query,
    SearchStatus? status,
    List<SearchResult>? found,
    SearchSort? sort,
    bool? evOnly,
    bool? coveredOnly,
    String? Function()? errorMessage,
  }) {
    return SearchState(
      query: query ?? this.query,
      status: status ?? this.status,
      found: found ?? this.found,
      sort: sort ?? this.sort,
      evOnly: evOnly ?? this.evOnly,
      coveredOnly: coveredOnly ?? this.coveredOnly,
      // A function so it can be set back to null.
      errorMessage: errorMessage != null ? errorMessage() : this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
    query,
    status,
    found,
    sort,
    evOnly,
    coveredOnly,
    errorMessage,
  ];
}
