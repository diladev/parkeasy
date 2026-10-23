import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';

class NotificationSettingsModel extends NotificationSettings {
  const NotificationSettingsModel({
    required super.values,
    required super.available,
  });

  /// The response of GET and PATCH /notifications/settings:
  /// { settings: { expiry_alerts: true, ... }, available: ['expiry_alerts'] }
  factory NotificationSettingsModel.fromMap(DataMap map) {
    final settings = map['settings'] as DataMap? ?? const {};
    final available = (map['available'] as List<dynamic>? ?? const [])
        .whereType<String>()
        .toSet();

    return NotificationSettingsModel(
      values: {
        for (final setting in NotificationSetting.values)
          setting: settings[setting.apiKey] == true,
      },
      available: {
        for (final setting in NotificationSetting.values)
          if (available.contains(setting.apiKey)) setting,
      },
    );
  }
}
