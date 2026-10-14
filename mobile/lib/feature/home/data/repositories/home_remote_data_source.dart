import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/data/models/booking_summary_model.dart';
import 'package:mobile/feature/home/data/models/nearby_lot_model.dart';

abstract class HomeRemoteDataSource {
  Future<List<NearbyLotModel>> getNearbyLots({
    required double latitude,
    required double longitude,
    required double radiusKm,
  });

  Future<List<BookingSummaryModel>> getMyBookings();

  Future<int> getUnreadNotificationCount();
}

class HomeRemoteDataSourceImpl implements HomeRemoteDataSource {
  HomeRemoteDataSourceImpl(this._api);

  final ApiClient _api;

  /// The API's largest page: enough for every lot in a city-sized radius.
  static const int _maxPageSize = 100;

  /// Enough bookings to find the user's regular lots.
  static const int _bookingsPageSize = 50;

  @override
  Future<List<NearbyLotModel>> getNearbyLots({
    required double latitude,
    required double longitude,
    required double radiusKm,
  }) async {
    final response = await _api.get(
      '$kNearbyParking?lat=$latitude&lng=$longitude'
      '&radius=$radiusKm&pageSize=$_maxPageSize',
    );
    return _items(response)
        .map((item) => NearbyLotModel.fromMap(item as DataMap))
        .toList();
  }

  @override
  Future<List<BookingSummaryModel>> getMyBookings() async {
    final response = await _api.get(
      '$kBookings?page=1&pageSize=$_bookingsPageSize',
    );
    return _items(response)
        .map((item) => BookingSummaryModel.fromMap(item as DataMap))
        .toList();
  }

  @override
  Future<int> getUnreadNotificationCount() async {
    final response = await _api.get(kUnreadNotifications);
    return (response.map['count'] as num? ?? 0).toInt();
  }

  /// Paginated lists come back as { data: [...], meta, links }.
  static List<dynamic> _items(ApiResponse response) =>
      response.map['data'] as List<dynamic>? ?? const [];
}
