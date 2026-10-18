import 'package:equatable/equatable.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';

/// One page of the inbox, and whether more pages follow.
class NotificationPage extends Equatable {
  const NotificationPage({required this.notifications, required this.hasMore});

  final List<AppNotification> notifications;
  final bool hasMore;

  @override
  List<Object?> get props => [notifications, hasMore];
}
