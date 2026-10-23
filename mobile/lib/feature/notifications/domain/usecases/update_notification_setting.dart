import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';

/// Turns one switch on or off; returns the settings as saved.
class UpdateNotificationSetting
    extends
        UsecaseWithParams<NotificationSettings, UpdateNotificationSettingParams> {
  const UpdateNotificationSetting(this._repository);
  final NotificationRepository _repository;

  @override
  ResultFuture<NotificationSettings> call(
    UpdateNotificationSettingParams params,
  ) => _repository.updateSetting(params.setting, params.value);
}

class UpdateNotificationSettingParams extends Equatable {
  const UpdateNotificationSettingParams(this.setting, this.value);

  final NotificationSetting setting;
  final bool value;

  @override
  List<Object?> get props => [setting, value];
}
