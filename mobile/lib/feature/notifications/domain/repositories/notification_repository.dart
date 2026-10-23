import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_page.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';

abstract class NotificationRepository {
  /// Newest first; every category when [category] is null.
  ResultFuture<NotificationPage> getNotifications({
    NotificationCategory? category,
    int page = 1,
  });

  ResultVoid markAsRead(int notificationId);

  ResultVoid markAllAsRead();

  ResultFuture<NotificationSettings> getSettings();

  ResultFuture<NotificationSettings> updateSetting(
    NotificationSetting setting,
    bool value,
  );
}
