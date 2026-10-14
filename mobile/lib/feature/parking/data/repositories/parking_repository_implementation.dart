import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/data/repositories/parking_remote_data_source.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';

class ParkingRepositoryImpl implements ParkingRepository {
  ParkingRepositoryImpl(this._remoteDataSource);

  final ParkingRemoteDataSource _remoteDataSource;

  @override
  ResultFuture<ParkingLotDetails> getLotDetails(int lotId) async {
    try {
      return Right(await _remoteDataSource.getLotDetails(lotId));
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    } catch (_) {
      return const Left(
        APIFailure(
          message: 'Something went wrong. Please try again.',
          statusCode: 500,
        ),
      );
    }
  }
}
