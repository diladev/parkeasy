import 'package:equatable/equatable.dart';

/// The categories the server files notifications under.
enum NotificationCategory {
  booking,
  wallet;

  static NotificationCategory? fromApi(String? value) {
    for (final category in values) {
      if (category.name == value) return category;
    }
    return null;
  }
}

/// One notification in the inbox. Named AppNotification so it doesn't clash
/// with Flutter's own Notification class.
class AppNotification extends Equatable {
  const AppNotification({
    required this.id,
    required this.category,
    required this.event,
    required this.title,
    required this.body,
    required this.isRead,
    required this.createdAt,
  });

  final int id;

  /// Null for a category this version of the app doesn't know.
  final NotificationCategory? category;

  /// What happened, e.g. BOOKING_CONFIRMED; picks the icon.
  final String event;

  /// Already translated by the server.
  final String title;
  final String body;
  final bool isRead;
  final DateTime createdAt;

  AppNotification markedRead() => AppNotification(
    id: id,
    category: category,
    event: event,
    title: title,
    body: body,
    isRead: true,
    createdAt: createdAt,
  );

  @override
  List<Object?> get props => [
    id,
    category,
    event,
    title,
    body,
    isRead,
    createdAt,
  ];
}
