import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_page.dart';

abstract class NotificationRepository {
  /// Newest first; every category when [category] is null.
  ResultFuture<NotificationPage> getNotifications({
    NotificationCategory? category,
    int page = 1,
  });

  ResultVoid markAsRead(int notificationId);

  ResultVoid markAllAsRead();
}
