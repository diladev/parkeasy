import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_details.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

abstract class ParkingRepository {
  ResultFuture<ParkingLotDetails> getLotDetails(int lotId);

  /// Lots matching [query] by name or address, or every lot around the user
  /// when [query] is empty.
  ResultFuture<List<ParkingLotSummary>> searchLots(String query);

  /// The lots the user saved, last saved first.
  ResultFuture<List<ParkingLotSummary>> getFavorites();

  /// Saves the lot, or removes it from the favorites.
  ResultVoid setFavorite(int lotId, {required bool isFavorite});
}
