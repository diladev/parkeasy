import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';
import 'package:mobile/feature/home/domain/entities/nearby_lot.dart';

abstract class HomeRepository {
  /// Lots within [radiusKm] of the point, closest first.
  ResultFuture<List<NearbyLot>> getNearbyLots({
    required double latitude,
    required double longitude,
    required double radiusKm,
  });

  /// The user's bookings, newest first.
  ResultFuture<List<BookingSummary>> getMyBookings();

  ResultFuture<int> getUnreadNotificationCount();
}
