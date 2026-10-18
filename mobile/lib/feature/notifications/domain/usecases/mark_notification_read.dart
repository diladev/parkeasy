import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';

class MarkNotificationRead extends UsecaseWithParams<void, int> {
  const MarkNotificationRead(this._repository);
  final NotificationRepository _repository;

  @override
  ResultVoid call(int notificationId) =>
      _repository.markAsRead(notificationId);
}
