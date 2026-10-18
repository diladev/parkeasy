import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/domain/usecases/get_notifications.dart';
import 'package:mobile/feature/notifications/domain/usecases/mark_all_notifications_read.dart';
import 'package:mobile/feature/notifications/domain/usecases/mark_notification_read.dart';
import 'notifications_state.dart';

/// The inbox: one tab at a time, page by page, and marking as read.
///
/// Marking as read updates the screen first and the server after, so taps
/// feel instant; if the server refuses, the change is undone.
class NotificationsCubit extends Cubit<NotificationsState> {
  NotificationsCubit(
    this._getNotifications,
    this._markRead,
    this._markAllRead,
  ) : super(const NotificationsState());

  final GetNotifications _getNotifications;
  final MarkNotificationRead _markRead;
  final MarkAllNotificationsRead _markAllRead;

  /// Only the newest request may update the list: switching tabs quickly
  /// must not show an older tab's answer.
  int _latestLoad = 0;

  /// Loads the current tab from its first page.
  Future<void> load() async {
    final loadId = ++_latestLoad;
    if (state.notifications.isEmpty) {
      emit(state.copyWith(status: NotificationsStatus.loading));
    }

    final result = await _getNotifications(
      GetNotificationsParams(category: state.tab.category),
    );
    if (isClosed || loadId != _latestLoad) return;

    result.fold(
      (failure) => emit(
        state.copyWith(
          status: state.notifications.isEmpty
              ? NotificationsStatus.failure
              : NotificationsStatus.loaded,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (page) => emit(
        state.copyWith(
          status: NotificationsStatus.loaded,
          notifications: page.notifications,
          page: 1,
          hasMore: page.hasMore,
          isLoadingMore: false,
        ),
      ),
    );
  }

  void selectTab(NotificationsTab tab) {
    if (tab == state.tab) return;
    emit(
      NotificationsState(tab: tab, errorSerial: state.errorSerial),
    );
    load();
  }

  /// The next page, when the list is scrolled to its end.
  Future<void> loadMore() async {
    if (!state.hasMore || state.isLoadingMore) return;
    final loadId = _latestLoad;
    emit(state.copyWith(isLoadingMore: true));

    final result = await _getNotifications(
      GetNotificationsParams(
        category: state.tab.category,
        page: state.page + 1,
      ),
    );
    if (isClosed || loadId != _latestLoad) return;

    result.fold(
      (failure) => emit(
        state.copyWith(
          isLoadingMore: false,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (page) => emit(
        state.copyWith(
          notifications: [...state.notifications, ...page.notifications],
          page: state.page + 1,
          hasMore: page.hasMore,
          isLoadingMore: false,
        ),
      ),
    );
  }

  Future<void> markRead(AppNotification notification) async {
    if (notification.isRead) return;
    _replace(notification.id, (n) => n.markedRead());

    final result = await _markRead(notification.id);
    if (isClosed) return;
    result.fold((failure) {
      _replace(notification.id, (_) => notification);
      _showError(failure.message);
    }, (_) {});
  }

  Future<void> markAllRead() async {
    final before = state.notifications;
    if (!state.hasUnread) return;
    emit(
      state.copyWith(
        notifications: [for (final n in before) n.markedRead()],
      ),
    );

    final result = await _markAllRead();
    if (isClosed) return;
    result.fold((failure) {
      emit(state.copyWith(notifications: before));
      _showError(failure.message);
    }, (_) {});
  }

  void _replace(int id, AppNotification Function(AppNotification) change) {
    emit(
      state.copyWith(
        notifications: [
          for (final n in state.notifications) n.id == id ? change(n) : n,
        ],
      ),
    );
  }

  void _showError(String message) => emit(
    state.copyWith(errorMessage: message, errorSerial: state.errorSerial + 1),
  );
}
