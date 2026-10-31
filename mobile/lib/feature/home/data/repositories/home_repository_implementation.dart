import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/data/repositories/home_remote_data_source.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';
import 'package:mobile/feature/home/domain/entities/nearby_lot.dart';
import 'package:mobile/feature/home/domain/repositories/home_repository.dart';

class HomeRepositoryImpl implements HomeRepository {
  HomeRepositoryImpl(this._remoteDataSource);

  final HomeRemoteDataSource _remoteDataSource;

  @override
  ResultFuture<List<NearbyLot>> getNearbyLots({
    required double latitude,
    required double longitude,
    required double radiusKm,
  }) {
    return _guard(
      () => _remoteDataSource.getNearbyLots(
        latitude: latitude,
        longitude: longitude,
        radiusKm: radiusKm,
      ),
    );
  }

  @override
  ResultFuture<List<BookingSummary>> getMyBookings() {
    return _guard(_remoteDataSource.getMyBookings);
  }

  @override
  ResultFuture<int> getUnreadNotificationCount() {
    return _guard(_remoteDataSource.getUnreadNotificationCount);
  }

  ResultFuture<T> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    } catch (_) {
      return Left(
        APIFailure(message: l10n.somethingWentWrong, statusCode: 500),
      );
    }
  }
}
