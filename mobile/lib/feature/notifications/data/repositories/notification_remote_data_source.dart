import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/data/models/app_notification_model.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_page.dart';

abstract class NotificationRemoteDataSource {
  Future<NotificationPage> getNotifications({
    NotificationCategory? category,
    int page = 1,
  });

  Future<void> markAsRead(int notificationId);

  Future<void> markAllAsRead();
}

class NotificationRemoteDataSourceImpl implements NotificationRemoteDataSource {
  NotificationRemoteDataSourceImpl(this._api);

  final ApiClient _api;

  static const int _pageSize = 20;

  @override
  Future<NotificationPage> getNotifications({
    NotificationCategory? category,
    int page = 1,
  }) async {
    final query = [
      'page=$page',
      'pageSize=$_pageSize',
      if (category != null) 'type=${category.name}',
    ].join('&');
    final response = await _api.get('$kNotifications?$query');

    // { data: [...], meta: { currentPage, totalPages, ... }, links }
    final items = response.map['data'] as List<dynamic>? ?? const [];
    final meta = response.map['meta'] as DataMap? ?? const {};
    final currentPage = (meta['currentPage'] as num? ?? page).toInt();
    final totalPages = (meta['totalPages'] as num? ?? page).toInt();

    return NotificationPage(
      notifications: items
          .map((item) => AppNotificationModel.fromMap(item as DataMap))
          .toList(),
      hasMore: currentPage < totalPages,
    );
  }

  @override
  Future<void> markAsRead(int notificationId) async {
    await _api.patch('$kNotifications/$notificationId/read');
  }

  @override
  Future<void> markAllAsRead() async {
    await _api.patch('$kNotifications/mark-all-read');
  }
}
