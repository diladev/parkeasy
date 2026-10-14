import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/feature/parking/data/models/parking_lot_details_model.dart';

abstract class ParkingRemoteDataSource {
  Future<ParkingLotDetailsModel> getLotDetails(int lotId);
}

class ParkingRemoteDataSourceImpl implements ParkingRemoteDataSource {
  ParkingRemoteDataSourceImpl(this._api);

  final ApiClient _api;

  @override
  Future<ParkingLotDetailsModel> getLotDetails(int lotId) async {
    final response = await _api.get('$kParking/$lotId');
    return ParkingLotDetailsModel.fromMap(response.map);
  }
}
