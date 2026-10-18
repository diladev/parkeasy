import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_page.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';

class GetNotifications
    extends UsecaseWithParams<NotificationPage, GetNotificationsParams> {
  const GetNotifications(this._repository);
  final NotificationRepository _repository;

  @override
  ResultFuture<NotificationPage> call(GetNotificationsParams params) =>
      _repository.getNotifications(
        category: params.category,
        page: params.page,
      );
}

class GetNotificationsParams extends Equatable {
  const GetNotificationsParams({this.category, this.page = 1});

  /// Null for every category.
  final NotificationCategory? category;
  final int page;

  @override
  List<Object?> get props => [category, page];
}
