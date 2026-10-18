import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';

class AppNotificationModel extends AppNotification {
  const AppNotificationModel({
    required super.id,
    required super.category,
    required super.event,
    required super.title,
    required super.body,
    required super.isRead,
    required super.createdAt,
  });

  /// One item of GET /notifications (title and body already translated).
  factory AppNotificationModel.fromMap(DataMap map) {
    final isRead = map['is_read'];
    return AppNotificationModel(
      id: (map['id'] as num).toInt(),
      category: NotificationCategory.fromApi(map['type'] as String?),
      event: map['event'] as String? ?? '',
      title: map['title'] as String? ?? '',
      body: map['body'] as String? ?? '',
      // MariaDB stores booleans as TINYINT, so accept 1/0 too.
      isRead: isRead == true || isRead == 1,
      // The API sends UTC; the app shows local time.
      createdAt: DateTime.parse(map['createdAt'] as String).toLocal(),
    );
  }
}
