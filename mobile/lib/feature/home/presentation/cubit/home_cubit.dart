import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/constants/default_location.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';
import 'package:mobile/feature/home/domain/usecases/get_my_bookings.dart';
import 'package:mobile/feature/home/domain/usecases/get_nearby_lots.dart';
import 'package:mobile/feature/home/domain/usecases/get_unread_notification_count.dart';
import 'home_state.dart';

/// The home tab: free spots nearby, the user's regular lots, recent bookings
/// and the unread notification count.
///
/// Each part loads on its own, so one failing request only empties its own
/// section instead of the whole screen.
class HomeCubit extends Cubit<HomeState> {
  HomeCubit(this._getNearbyLots, this._getMyBookings, this._getUnreadCount)
    : super(const HomeState());

  final GetNearbyLots _getNearbyLots;
  final GetMyBookings _getMyBookings;
  final GetUnreadNotificationCount _getUnreadCount;

  static const int _maxRegulars = 5;
  static const int _maxRecentBookings = 3;

  Future<void> load() async {
    // Started together, so the three requests run in parallel.
    final nearbyRequest = _getNearbyLots(
      const NearbyLotsParams(
        latitude: DefaultLocation.latitude,
        longitude: DefaultLocation.longitude,
        radiusKm: DefaultLocation.searchRadiusKm,
      ),
    );
    final bookingsRequest = _getMyBookings();
    final unreadRequest = _getUnreadCount();

    final nearby = await nearbyRequest;
    final bookings = (await bookingsRequest).getOrElse(() => const []);
    final unread = (await unreadRequest).getOrElse(() => 0);

    emit(
      HomeState(
        status: HomeStatus.loaded,
        spotsNearby: nearby.fold(
          (_) => null,
          (lots) => lots.fold<int>(0, (sum, lot) => sum + lot.availableSlots),
        ),
        regulars: _regularsFrom(bookings),
        recentBookings: bookings.take(_maxRecentBookings).toList(),
        unreadNotifications: unread,
      ),
    );
  }

  /// The lots the user booked most, most visits first. Cancelled bookings
  /// don't count; on a tie, the lot booked most recently comes first.
  static List<RegularLot> _regularsFrom(List<BookingSummary> bookings) {
    final visits = <int, int>{};
    final names = <int, String>{};
    final firstSeen = <int, int>{};

    for (final (index, booking) in bookings.indexed) {
      if (booking.status == BookingStatus.cancelled) continue;
      visits.update(booking.lotId, (count) => count + 1, ifAbsent: () => 1);
      names.putIfAbsent(booking.lotId, () => booking.lotName);
      firstSeen.putIfAbsent(booking.lotId, () => index);
    }

    final lots = visits.keys.toList()
      ..sort((a, b) {
        final byVisits = visits[b]!.compareTo(visits[a]!);
        return byVisits != 0 ? byVisits : firstSeen[a]!.compareTo(firstSeen[b]!);
      });

    return lots
        .take(_maxRegulars)
        .map(
          (lotId) => RegularLot(
            lotId: lotId,
            name: names[lotId]!,
            visits: visits[lotId]!,
          ),
        )
        .toList();
  }
}
