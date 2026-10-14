import 'package:equatable/equatable.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

enum HomeStatus { loading, loaded }

/// A lot the user has booked before, for the "Your regulars" carousel.
class RegularLot extends Equatable {
  const RegularLot({
    required this.lotId,
    required this.name,
    required this.visits,
  });

  final int lotId;
  final String name;
  final int visits;

  @override
  List<Object?> get props => [lotId, name, visits];
}

class HomeState extends Equatable {
  const HomeState({
    this.status = HomeStatus.loading,
    this.spotsNearby,
    this.regulars = const [],
    this.recentBookings = const [],
    this.unreadNotifications = 0,
  });

  final HomeStatus status;

  /// Free slots in every lot near the user, or null if they couldn't be loaded.
  final int? spotsNearby;

  final List<RegularLot> regulars;
  final List<BookingSummary> recentBookings;
  final int unreadNotifications;

  @override
  List<Object?> get props => [
    status,
    spotsNearby,
    regulars,
    recentBookings,
    unreadNotifications,
  ];
}
