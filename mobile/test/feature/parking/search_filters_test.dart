import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_filters.dart';

SearchResult lot(
  String name, {
  int price = 1000,
  double km = 1,
  double rating = 4,
  bool covered = false,
  bool ev = false,
  bool open24h = false,
}) {
  return SearchResult(
    distanceKm: km,
    lot: ParkingLotSummary(
      id: name.hashCode,
      name: name,
      address: '',
      latitude: 0,
      longitude: 0,
      pricePerHour: price,
      availableSlots: 5,
      totalSlots: 10,
      hasCctv: false,
      hasEvCharging: ev,
      isCovered: covered,
      isAccessible: false,
      rating: rating,
      isOpen24h: open24h,
    ),
  );
}

List<String> names(List<SearchResult> results) =>
    [for (final result in results) result.lot.name];

void main() {
  final found = [
    lot('Far cheap', price: 750, km: 4, rating: 3.9),
    lot('Near pricey', price: 2000, km: 0.3, rating: 4.8, covered: true),
    lot('Middle', price: 1500, km: 0.8, rating: 4.6, ev: true, open24h: true),
  ];

  test('the defaults show everything, nearest first', () {
    const filters = SearchFilters();

    expect(names(filters.apply(found)), ['Near pricey', 'Middle', 'Far cheap']);
    expect(filters.activeCount, 0);
  });

  test('sorts by price or rating', () {
    expect(
      names(const SearchFilters(sort: SearchSort.cheapest).apply(found)),
      ['Far cheap', 'Middle', 'Near pricey'],
    );
    expect(
      names(const SearchFilters(sort: SearchSort.topRated).apply(found)),
      ['Near pricey', 'Middle', 'Far cheap'],
    );
  });

  test('a price range keeps both ends; no upper limit means and more', () {
    expect(
      names(const SearchFilters(minPrice: 750, maxPrice: 1500).apply(found)),
      ['Middle', 'Far cheap'],
    );
    expect(
      names(const SearchFilters(minPrice: 1500).apply(found)),
      ['Near pricey', 'Middle'],
    );
  });

  test('a distance limit hides lots further away', () {
    expect(
      names(const SearchFilters(distance: DistanceLimit.km1).apply(found)),
      ['Near pricey', 'Middle'],
    );
  });

  test('every chosen amenity must be offered', () {
    final filters = const SearchFilters()
        .toggle(Amenity.evCharging)
        .toggle(Amenity.open24h);

    expect(names(filters.apply(found)), ['Middle']);
    expect(filters.activeCount, 2);
    expect(filters.toggle(Amenity.evCharging).amenities, {Amenity.open24h});
  });

  test('the price limit can be cleared back to none', () {
    const filters = SearchFilters(maxPrice: 1000);

    expect(filters.copyWith(maxPrice: () => null).maxPrice, isNull);
    expect(filters.copyWith(distance: DistanceLimit.km5).maxPrice, 1000);
  });
}
