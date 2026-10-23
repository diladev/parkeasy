import 'package:equatable/equatable.dart';

/// A switch on the Notifications screen, by its API name.
enum NotificationSetting {
  bookingReminders('booking_reminders'),
  expiryAlerts('expiry_alerts'),
  offers('offers'),
  loyaltyRewards('loyalty_rewards'),
  bookingReceiptEmails('booking_receipt_emails'),
  newsletter('newsletter');

  const NotificationSetting(this.apiKey);

  final String apiKey;
}

/// The user's choices, and which switches ParkEasy acts on yet. The server
/// says which are available, so a feature switches on without an app update.
class NotificationSettings extends Equatable {
  const NotificationSettings({required this.values, required this.available});

  final Map<NotificationSetting, bool> values;
  final Set<NotificationSetting> available;

  bool isAvailable(NotificationSetting setting) => available.contains(setting);

  /// A switch that does nothing yet shows as off.
  bool isOn(NotificationSetting setting) =>
      isAvailable(setting) && (values[setting] ?? false);

  NotificationSettings copyWith(NotificationSetting setting, bool value) =>
      NotificationSettings(
        values: {...values, setting: value},
        available: available,
      );

  @override
  List<Object?> get props => [values, available];
}
