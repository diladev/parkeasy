import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';

class GetNotificationSettings
    extends UsecaseWithoutParams<NotificationSettings> {
  const GetNotificationSettings(this._repository);
  final NotificationRepository _repository;

  @override
  ResultFuture<NotificationSettings> call() => _repository.getSettings();
}
