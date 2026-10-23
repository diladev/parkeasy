import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/notifications/data/models/notification_settings_model.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_page.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';
import 'package:mobile/feature/notifications/domain/repositories/notification_repository.dart';
import 'package:mobile/feature/notifications/domain/usecases/get_notification_settings.dart';
import 'package:mobile/feature/notifications/domain/usecases/update_notification_setting.dart';
import 'package:mobile/feature/notifications/presentation/cubit/notification_settings_cubit.dart';

/// The API's answer for a new user.
final defaults = NotificationSettingsModel.fromMap({
  'settings': {
    'booking_reminders': true,
    'expiry_alerts': true,
    'offers': false,
    'loyalty_rewards': true,
    'booking_receipt_emails': true,
    'newsletter': false,
  },
  'available': ['expiry_alerts', 'booking_receipt_emails'],
});

/// Saves in memory; set [failWith] to make saving fail.
class FakeNotificationRepository implements NotificationRepository {
  NotificationSettings saved = defaults;
  String? failWith;
  int updates = 0;

  @override
  ResultFuture<NotificationSettings> getSettings() async => Right(saved);

  @override
  ResultFuture<NotificationSettings> updateSetting(
    NotificationSetting setting,
    bool value,
  ) async {
    updates++;
    final message = failWith;
    if (message != null) {
      return Left(APIFailure(message: message, statusCode: 500));
    }
    return Right(saved = saved.copyWith(setting, value));
  }

  @override
  ResultFuture<NotificationPage> getNotifications({
    NotificationCategory? category,
    int page = 1,
  }) => throw UnimplementedError();

  @override
  ResultVoid markAsRead(int notificationId) => throw UnimplementedError();

  @override
  ResultVoid markAllAsRead() => throw UnimplementedError();
}

void main() {
  late FakeNotificationRepository repository;
  late NotificationSettingsCubit cubit;

  setUp(() async {
    repository = FakeNotificationRepository();
    cubit = NotificationSettingsCubit(
      GetNotificationSettings(repository),
      UpdateNotificationSetting(repository),
    );
    await cubit.load();
  });

  tearDown(() => cubit.close());

  test('reads the switches and which ones work', () {
    final settings = cubit.state.settings!;

    expect(settings.isOn(NotificationSetting.expiryAlerts), isTrue);
    expect(settings.isAvailable(NotificationSetting.offers), isFalse);
    // Stored as on, but it does nothing yet, so it shows off.
    expect(settings.isOn(NotificationSetting.loyaltyRewards), isFalse);
  });

  test('turning a switch off saves it', () async {
    await cubit.toggle(NotificationSetting.expiryAlerts, false);

    expect(cubit.state.settings!.isOn(NotificationSetting.expiryAlerts), false);
    expect(repository.saved.values[NotificationSetting.expiryAlerts], false);
  });

  test('a switch that failed to save moves back and shows why', () async {
    repository.failWith = 'No connection';

    await cubit.toggle(NotificationSetting.bookingReceiptEmails, false);

    final settings = cubit.state.settings!;
    expect(settings.isOn(NotificationSetting.bookingReceiptEmails), isTrue);
    expect(cubit.state.errorMessage, 'No connection');
    expect(cubit.state.errorSerial, 1);
  });

  test('a switch that does nothing yet is not sent', () async {
    await cubit.toggle(NotificationSetting.newsletter, true);

    expect(repository.updates, 0);
    expect(cubit.state.settings!.isOn(NotificationSetting.newsletter), false);
  });
}
