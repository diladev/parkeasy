import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/usecases/get_bookings.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';
import 'my_bookings_state.dart';

/// The Bookings tab: the active booking, and the history page by page.
class MyBookingsCubit extends Cubit<MyBookingsState> {
  MyBookingsCubit(this._getBookings) : super(const MyBookingsState());

  final GetBookings _getBookings;

  /// Loads both tabs from the start.
  Future<void> load() async {
    await Future.wait([_loadActive(), _loadHistory(page: 1)]);
  }

  void selectTab(BookingsTab tab) {
    if (tab != state.tab) emit(state.copyWith(tab: tab));
  }

  /// The next page of the history, when the list is scrolled to its end.
  Future<void> loadMoreHistory() async {
    final history = state.history;
    if (!history.hasMore || history.isLoadingMore) return;
    emit(
      state.copyWith(
        history: BookingList(
          status: history.status,
          bookings: history.bookings,
          page: history.page,
          hasMore: history.hasMore,
          isLoadingMore: true,
        ),
      ),
    );
    await _loadHistory(page: history.page + 1);
  }

  Future<void> _loadActive() async {
    final result = await _getBookings(
      const GetBookingsParams(status: BookingStatus.active),
    );
    emit(
      state.copyWith(
        active: result.fold(
          (failure) => _failed(state.active, failure.message),
          (page) => BookingList(
            status: BookingListStatus.loaded,
            bookings: page.bookings,
            page: 1,
          ),
        ),
      ),
    );
  }

  /// The API lists every booking; the history is the ones that ended.
  Future<void> _loadHistory({required int page}) async {
    final result = await _getBookings(GetBookingsParams(page: page));
    final previous = page == 1 ? const <Booking>[] : state.history.bookings;
    emit(
      state.copyWith(
        history: result.fold(
          (failure) => _failed(state.history, failure.message),
          (loaded) => BookingList(
            status: BookingListStatus.loaded,
            bookings: [
              ...previous,
              ...loaded.bookings.where((booking) => !booking.isActive),
            ],
            page: page,
            hasMore: loaded.hasMore,
          ),
        ),
      ),
    );
  }

  /// A failed first load shows the error; a failed refresh or next page keeps
  /// the list that's already on screen.
  static BookingList _failed(BookingList list, String message) => BookingList(
    status: list.bookings.isEmpty
        ? BookingListStatus.failure
        : BookingListStatus.loaded,
    bookings: list.bookings,
    page: list.page,
    hasMore: list.hasMore,
    errorMessage: message,
  );
}
