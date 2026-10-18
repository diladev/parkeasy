import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';

class MarkAllNotificationsRead extends UsecaseWithoutParams<void> {
  const MarkAllNotificationsRead(this._repository);
  final NotificationRepository _repository;

  @override
  ResultVoid call() => _repository.markAllAsRead();
}
