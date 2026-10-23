import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/notifications/domain/entities/app_notification.dart';

/// A notification: icon, title, message and time. Unread ones are tinted
/// teal with a dot.
class NotificationCard extends StatelessWidget {
  const NotificationCard({
    super.key,
    required this.notification,
    required this.onTap,
  });

  final AppNotification notification;
  final VoidCallback onTap;

  /// "9:00 AM" today, "12 Oct · 3:40 PM" before that.
  String get _time {
    final at = notification.createdAt;
    final day = Formatters.day(at);
    return day == 'Today'
        ? Formatters.time(at)
        : '$day · ${Formatters.time(at)}';
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final isUnread = !notification.isRead;
    final look = _EventLook.of(notification.event, palette);

    return Semantics(
      button: true,
      label: isUnread ? 'Unread' : null,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          constraints: const BoxConstraints(minHeight: 80),
          padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
          decoration: BoxDecoration(
            color: isUnread ? AppColors.tealBg : palette.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isUnread ? AppColors.teal : palette.border,
              width: 0.5,
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Container(
                  width: 36,
                  height: 36,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    // Unread: solid teal with a light icon, as in the design.
                    color: isUnread ? AppColors.tealDim : look.background,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Icon(
                    look.icon,
                    size: 24,
                    color: isUnread ? AppColors.textPrimary : look.foreground,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: palette.textPrimary,
                            ),
                          ),
                        ),
                        if (isUnread)
                          Container(
                            width: 8,
                            height: 8,
                            margin: const EdgeInsets.only(left: 8),
                            decoration: const BoxDecoration(
                              color: AppColors.teal,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      notification.body,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 9,
                        height: 1.3,
                        color: palette.textMuted,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _time,
                      style: TextStyle(fontSize: 9, color: palette.textHint),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The icon and colours for each kind of notification.
class _EventLook {
  const _EventLook(this.icon, this.background, this.foreground);

  final IconData icon;
  final Color background;
  final Color foreground;

  static _EventLook of(String event, AppPalette palette) => switch (event) {
    'BOOKING_CONFIRMED' => const _EventLook(
      LucideIcons.check,
      AppColors.tealBg,
      AppColors.teal,
    ),
    'BOOKING_EXTENDED' => const _EventLook(
      LucideIcons.clock2,
      AppColors.tealBg,
      AppColors.teal,
    ),
    'BOOKING_ENDING_SOON' => const _EventLook(
      LucideIcons.hourglass,
      AppColors.amber15,
      AppColors.amber,
    ),
    'BOOKING_COMPLETED' => const _EventLook(
      LucideIcons.receipt,
      AppColors.tealBg,
      AppColors.teal,
    ),
    'BOOKING_CANCELLED' => const _EventLook(
      LucideIcons.circleX,
      AppColors.red12,
      AppColors.red,
    ),
    'WALLET_TOPPED_UP' => const _EventLook(
      LucideIcons.wallet,
      AppColors.amber15,
      AppColors.amber,
    ),
    _ => _EventLook(LucideIcons.bell, palette.surface2, palette.textMuted),
  };
}
