import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';

abstract class ParkingRepository {
  ResultFuture<ParkingLotDetails> getLotDetails(int lotId);
}
