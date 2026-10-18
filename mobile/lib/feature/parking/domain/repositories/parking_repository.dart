import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

abstract class ParkingRepository {
  ResultFuture<ParkingLotDetails> getLotDetails(int lotId);

  /// Lots matching [query] by name or address, or every lot around the user
  /// when [query] is empty.
  ResultFuture<List<ParkingLotSummary>> searchLots(String query);
}
