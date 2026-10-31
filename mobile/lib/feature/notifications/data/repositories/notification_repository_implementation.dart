import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/data/repositories/notification_remote_data_source.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_page.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  NotificationRepositoryImpl(this._remoteDataSource);

  final NotificationRemoteDataSource _remoteDataSource;

  @override
  ResultFuture<NotificationPage> getNotifications({
    NotificationCategory? category,
    int page = 1,
  }) {
    return _guard(
      () => _remoteDataSource.getNotifications(category: category, page: page),
    );
  }

  @override
  ResultVoid markAsRead(int notificationId) {
    return _guard(() => _remoteDataSource.markAsRead(notificationId));
  }

  @override
  ResultVoid markAllAsRead() {
    return _guard(_remoteDataSource.markAllAsRead);
  }

  @override
  ResultFuture<NotificationSettings> getSettings() {
    return _guard(_remoteDataSource.getSettings);
  }

  @override
  ResultFuture<NotificationSettings> updateSetting(
    NotificationSetting setting,
    bool value,
  ) {
    return _guard(() => _remoteDataSource.updateSetting(setting, value));
  }

  ResultFuture<T> _guard<T>(Future<T> Function() action) async {
    try {
      return Right(await action());
    } on APIException catch (e) {
      return Left(APIFailure.fromException(e));
    } catch (_) {
      return Left(
        APIFailure(message: l10n.somethingWentWrong, statusCode: 500),
      );
    }
  }
}
