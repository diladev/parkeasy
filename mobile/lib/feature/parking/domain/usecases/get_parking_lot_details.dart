import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';

class GetParkingLotDetails extends UsecaseWithParams<ParkingLotDetails, int> {
  const GetParkingLotDetails(this._repository);
  final ParkingRepository _repository;

  @override
  ResultFuture<ParkingLotDetails> call(int lotId) =>
      _repository.getLotDetails(lotId);
}
