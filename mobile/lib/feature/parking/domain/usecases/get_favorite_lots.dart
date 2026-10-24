import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';

class GetFavoriteLots extends UsecaseWithoutParams<List<ParkingLotSummary>> {
  const GetFavoriteLots(this._repository);
  final ParkingRepository _repository;

  @override
  ResultFuture<List<ParkingLotSummary>> call() => _repository.getFavorites();
}
