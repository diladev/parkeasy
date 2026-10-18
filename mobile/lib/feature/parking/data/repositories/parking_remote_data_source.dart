import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/constants/default_location.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/data/models/parking_lot_details_model.dart';
import 'package:mobile/feature/parking/data/models/parking_lot_summary_model.dart';

abstract class ParkingRemoteDataSource {
  Future<ParkingLotDetailsModel> getLotDetails(int lotId);

  Future<List<ParkingLotSummaryModel>> searchLots(String query);
}

class ParkingRemoteDataSourceImpl implements ParkingRemoteDataSource {
  ParkingRemoteDataSourceImpl(this._api);

  final ApiClient _api;

  @override
  Future<ParkingLotDetailsModel> getLotDetails(int lotId) async {
    final response = await _api.get('$kParking/$lotId');
    return ParkingLotDetailsModel.fromMap(response.map);
  }

  /// The API's largest page and search radius: enough for every lot in town.
  static const int _maxPageSize = 100;
  static const int _maxRadiusKm = 50;

  @override
  Future<List<ParkingLotSummaryModel>> searchLots(String query) async {
    final text = query.trim();
    final url = text.isEmpty
        ? '$kNearbyParking?lat=${DefaultLocation.latitude}'
              '&lng=${DefaultLocation.longitude}'
              '&radius=$_maxRadiusKm&pageSize=$_maxPageSize'
        : '$kSearchParking?q=${Uri.encodeQueryComponent(text)}'
              '&pageSize=$_maxPageSize';

    final response = await _api.get(url);
    // { data: [...], meta, links }
    final items = response.map['data'] as List<dynamic>? ?? const [];
    return items
        .map((item) => ParkingLotSummaryModel.fromMap(item as DataMap))
        .toList();
  }
}
