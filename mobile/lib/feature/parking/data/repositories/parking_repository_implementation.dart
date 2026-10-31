import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/data/repositories/parking_remote_data_source.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';

class ParkingRepositoryImpl implements ParkingRepository {
  ParkingRepositoryImpl(this._remoteDataSource);

  final ParkingRemoteDataSource _remoteDataSource;

  @override
  ResultFuture<ParkingLotDetails> getLotDetails(int lotId) {
    return _guard(() => _remoteDataSource.getLotDetails(lotId));
  }

  @override
  ResultFuture<List<ParkingLotSummary>> searchLots(String query) {
    return _guard(() => _remoteDataSource.searchLots(query));
  }

  @override
  ResultFuture<List<ParkingLotSummary>> getFavorites() {
    return _guard(_remoteDataSource.getFavorites);
  }

  @override
  ResultVoid setFavorite(int lotId, {required bool isFavorite}) {
    return _guard(
      () => _remoteDataSource.setFavorite(lotId, isFavorite: isFavorite),
    );
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
