import 'package:equatable/equatable.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';

enum BookingsTab { active, history }

enum BookingListStatus { loading, loaded, failure }

/// One tab's list.
class BookingList extends Equatable {
  const BookingList({
    this.status = BookingListStatus.loading,
    this.bookings = const [],
    this.page = 0,
    this.hasMore = false,
    this.isLoadingMore = false,
    this.errorMessage,
  });

  final BookingListStatus status;
  final List<Booking> bookings;

  /// The last page loaded.
  final int page;
  final bool hasMore;
  final bool isLoadingMore;
  final String? errorMessage;

  @override
  List<Object?> get props => [
    status,
    bookings,
    page,
    hasMore,
    isLoadingMore,
    errorMessage,
  ];
}

class MyBookingsState extends Equatable {
  const MyBookingsState({
    this.tab = BookingsTab.active,
    this.active = const BookingList(),
    this.history = const BookingList(),
  });

  final BookingsTab tab;
  final BookingList active;

  /// Completed and cancelled bookings.
  final BookingList history;

  BookingList get current => tab == BookingsTab.active ? active : history;

  MyBookingsState copyWith({
    BookingsTab? tab,
    BookingList? active,
    BookingList? history,
  }) {
    return MyBookingsState(
      tab: tab ?? this.tab,
      active: active ?? this.active,
      history: history ?? this.history,
    );
  }

  @override
  List<Object?> get props => [tab, active, history];
}
