import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';
import 'package:mobile/feature/parking/domain/usecases/get_favorite_lots.dart';
import 'package:mobile/feature/parking/domain/usecases/get_parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/usecases/set_favorite.dart';
import 'package:mobile/feature/parking/presentation/cubit/favorites_cubit.dart';
import 'package:mobile/feature/parking/presentation/cubit/parking_details_cubit.dart';

ParkingLotSummary summary(int id) => ParkingLotSummary(
  id: id,
  name: 'Lot $id',
  address: '',
  latitude: 35.55,
  longitude: 45.43,
  pricePerHour: 1000,
  availableSlots: 5,
  totalSlots: 10,
  hasCctv: false,
  hasEvCharging: false,
  isCovered: false,
  isAccessible: false,
  rating: 4,
  isOpen24h: true,
);

ParkingLotDetails details(int id, {required bool isFavorite}) =>
    ParkingLotDetails(
      id: id,
      name: 'Lot $id',
      address: '',
      latitude: 35.55,
      longitude: 45.43,
      pricePerHour: 1000,
      rating: 4,
      isOpen24h: true,
      openingTime: '00:00',
      closingTime: '00:00',
      hasCctv: false,
      hasEvCharging: false,
      isCovered: false,
      isAccessible: false,
      availableSlots: 5,
      totalSlots: 10,
      slots: const [],
      isFavorite: isFavorite,
    );

/// The server's favorites in memory; [failWith] makes saving fail.
class FakeParkingRepository implements ParkingRepository {
  final Set<int> saved = {1, 2};
  String? failWith;

  @override
  ResultFuture<List<ParkingLotSummary>> getFavorites() async =>
      Right([for (final id in saved) summary(id)]);

  @override
  ResultVoid setFavorite(int lotId, {required bool isFavorite}) async {
    final message = failWith;
    if (message != null) {
      return Left(APIFailure(message: message, statusCode: 500));
    }
    isFavorite ? saved.add(lotId) : saved.remove(lotId);
    return const Right(null);
  }

  @override
  ResultFuture<ParkingLotDetails> getLotDetails(int lotId) async =>
      Right(details(lotId, isFavorite: saved.contains(lotId)));

  @override
  ResultFuture<List<ParkingLotSummary>> searchLots(String query) =>
      throw UnimplementedError();
}

void main() {
  late FakeParkingRepository repository;

  setUp(() => repository = FakeParkingRepository());

  group('FavoritesCubit', () {
    late FavoritesCubit cubit;

    setUp(() async {
      cubit = FavoritesCubit(
        GetFavoriteLots(repository),
        SetFavorite(repository),
      );
      await cubit.load();
    });

    tearDown(() => cubit.close());

    test('loads the saved lots', () {
      expect([for (final lot in cubit.state.lots) lot.id], [1, 2]);
    });

    test('removing hides the lot and saves it', () async {
      await cubit.remove(summary(1));

      expect([for (final lot in cubit.state.lots) lot.id], [2]);
      expect(repository.saved, {2});
    });

    test('a removal the server refuses puts the lot back', () async {
      repository.failWith = 'Offline';

      await cubit.remove(summary(1));

      expect([for (final lot in cubit.state.lots) lot.id], [1, 2]);
      expect(cubit.state.errorMessage, 'Offline');
    });

    test('undo saves it again', () async {
      await cubit.remove(summary(1));
      await cubit.restore(summary(1));

      expect(repository.saved, containsAll([1, 2]));
    });
  });

  group('ParkingDetailsCubit heart', () {
    late ParkingDetailsCubit cubit;

    setUp(() async {
      cubit = ParkingDetailsCubit(
        GetParkingLotDetails(repository),
        SetFavorite(repository),
      );
      await cubit.load(3);
    });

    tearDown(() => cubit.close());

    test('shows whether the lot is saved, and toggles it', () async {
      expect(cubit.state.isFavorite, isFalse);

      await cubit.toggleFavorite();

      expect(cubit.state.isFavorite, isTrue);
      expect(repository.saved, contains(3));
    });

    test('goes back when saving fails', () async {
      repository.failWith = 'Offline';

      await cubit.toggleFavorite();

      expect(cubit.state.isFavorite, isFalse);
      expect(cubit.state.errorMessage, 'Offline');
    });
  });
}
