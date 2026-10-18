import 'package:equatable/equatable.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';

/// The tabs: everything, or one category.
enum NotificationsTab {
  all(null),
  bookings(NotificationCategory.booking),
  wallet(NotificationCategory.wallet);

  const NotificationsTab(this.category);

  /// What the server filters by; null for every category.
  final NotificationCategory? category;
}

enum NotificationsStatus { loading, loaded, failure }

class NotificationsState extends Equatable {
  const NotificationsState({
    this.tab = NotificationsTab.all,
    this.status = NotificationsStatus.loading,
    this.notifications = const [],
    this.page = 0,
    this.hasMore = false,
    this.isLoadingMore = false,
    this.errorMessage,
    this.errorSerial = 0,
  });

  final NotificationsTab tab;
  final NotificationsStatus status;
  final List<AppNotification> notifications;

  /// The last page loaded.
  final int page;
  final bool hasMore;
  final bool isLoadingMore;
  final String? errorMessage;

  /// New for every error, so the screen shows two identical errors in a row.
  final int errorSerial;

  bool get hasUnread => notifications.any((n) => !n.isRead);

  NotificationsState copyWith({
    NotificationsTab? tab,
    NotificationsStatus? status,
    List<AppNotification>? notifications,
    int? page,
    bool? hasMore,
    bool? isLoadingMore,
    String? errorMessage,
    int? errorSerial,
  }) {
    return NotificationsState(
      tab: tab ?? this.tab,
      status: status ?? this.status,
      notifications: notifications ?? this.notifications,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      errorMessage: errorMessage ?? this.errorMessage,
      errorSerial: errorSerial ?? this.errorSerial,
    );
  }

  @override
  List<Object?> get props => [
    tab,
    status,
    notifications,
    page,
    hasMore,
    isLoadingMore,
    errorMessage,
    errorSerial,
  ];
}
