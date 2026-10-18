import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';

/// Lots whose name or address contains the query; every lot around the user
/// when the query is empty.
class SearchParkingLots
    extends UsecaseWithParams<List<ParkingLotSummary>, String> {
  const SearchParkingLots(this._repository);
  final ParkingRepository _repository;

  @override
  ResultFuture<List<ParkingLotSummary>> call(String query) =>
      _repository.searchLots(query);
}
