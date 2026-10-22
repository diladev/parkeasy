import 'package:equatable/equatable.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

/// A lot in the results with its distance from the user.
class SearchResult extends Equatable {
  const SearchResult({required this.lot, required this.distanceKm});

  final ParkingLotSummary lot;
  final double distanceKm;

  @override
  List<Object?> get props => [lot, distanceKm];
}

/// How the results are ordered.
enum SearchSort {
  nearest('Nearest'),
  cheapest('Cheapest'),
  topRated('Top rated');

  const SearchSort(this.label);

  final String label;
}

/// How far a lot may be.
enum DistanceLimit {
  m500('500 m', 0.5),
  km1('1 km', 1),
  km5('5 km', 5),
  any('Any', null);

  const DistanceLimit(this.label, this.maxKm);

  final String label;

  /// Null for no limit.
  final double? maxKm;
}

/// What a lot must offer.
enum Amenity {
  covered('Covered'),
  evCharging('EV charging'),
  accessible('Accessible'),
  cctv('CCTV'),
  open24h('24h open');

  const Amenity(this.label);

  final String label;

  bool isOfferedBy(ParkingLotSummary lot) => switch (this) {
    Amenity.covered => lot.isCovered,
    Amenity.evCharging => lot.hasEvCharging,
    Amenity.accessible => lot.isAccessible,
    Amenity.cctv => lot.hasCctv,
    Amenity.open24h => lot.isOpen24h,
  };
}

/// What the Filters sheet and the chips choose: which lots show, and in
/// what order. It filters what the server found, so changing it needs no
/// new request.
class SearchFilters extends Equatable {
  const SearchFilters({
    this.minPrice = 0,
    this.maxPrice,
    this.distance = DistanceLimit.any,
    this.amenities = const {},
    this.sort = SearchSort.nearest,
  });

  /// The price slider's range, in whole dinars per hour. Its top end means
  /// "and more", so [maxPrice] is null there.
  static const int priceSliderMax = 5000;
  static const int priceStep = 250;

  /// The lowest price per hour shown, in whole dinars.
  final int minPrice;

  /// The highest price per hour shown; null for no limit.
  final int? maxPrice;
  final DistanceLimit distance;
  final Set<Amenity> amenities;
  final SearchSort sort;

  /// How many filters differ from the defaults (the sort isn't a filter).
  int get activeCount =>
      (minPrice > 0 || maxPrice != null ? 1 : 0) +
      (distance != DistanceLimit.any ? 1 : 0) +
      amenities.length;

  bool matches(SearchResult result) {
    final lot = result.lot;
    final maxKm = distance.maxKm;
    final max = maxPrice;
    return lot.pricePerHour >= minPrice &&
        (max == null || lot.pricePerHour <= max) &&
        (maxKm == null || result.distanceKm <= maxKm) &&
        amenities.every((amenity) => amenity.isOfferedBy(lot));
  }

  /// The lots that match, in the chosen order. Ties go to the nearest.
  List<SearchResult> apply(List<SearchResult> found) {
    final shown = found.where(matches).toList();
    shown.sort((a, b) {
      final byChoice = switch (sort) {
        SearchSort.nearest => 0,
        SearchSort.cheapest => a.lot.pricePerHour.compareTo(b.lot.pricePerHour),
        SearchSort.topRated => b.lot.rating.compareTo(a.lot.rating),
      };
      return byChoice != 0 ? byChoice : a.distanceKm.compareTo(b.distanceKm);
    });
    return shown;
  }

  SearchFilters toggle(Amenity amenity) => copyWith(
    amenities: amenities.contains(amenity)
        ? ({...amenities}..remove(amenity))
        : {...amenities, amenity},
  );

  SearchFilters copyWith({
    int? minPrice,
    int? Function()? maxPrice,
    DistanceLimit? distance,
    Set<Amenity>? amenities,
    SearchSort? sort,
  }) {
    return SearchFilters(
      minPrice: minPrice ?? this.minPrice,
      // A function so it can be set back to null (no limit).
      maxPrice: maxPrice != null ? maxPrice() : this.maxPrice,
      distance: distance ?? this.distance,
      amenities: amenities ?? this.amenities,
      sort: sort ?? this.sort,
    );
  }

  @override
  List<Object?> get props => [minPrice, maxPrice, distance, amenities, sort];
}
