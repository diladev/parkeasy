import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/constants/default_location.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The top of the home tab: the user's area and the notifications bell.
class HomeHeader extends StatelessWidget {
  const HomeHeader({
    super.key,
    required this.hasUnread,
    required this.onNotifications,
  });

  final bool hasUnread;
  final VoidCallback onNotifications;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return SizedBox(
      height: 62,
      child: Stack(
        children: [
          PositionedDirectional(
            start: 18,
            top: 18,
            child: Container(
              width: 14,
              height: 14,
              decoration: const BoxDecoration(
                color: AppColors.teal,
                shape: BoxShape.circle,
              ),
            ),
          ),
          PositionedDirectional(
            start: 36,
            top: 10,
            end: 70,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  l10n.yourLocation,
                  style: TextStyle(fontSize: 10, color: palette.textHint),
                ),
                const SizedBox(height: 4),
                Text(
                  DefaultLocation.areaName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: palette.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          PositionedDirectional(
            end: 16,
            top: 14,
            child: _BellButton(hasUnread: hasUnread, onTap: onNotifications),
          ),
        ],
      ),
    );
  }
}

class _BellButton extends StatelessWidget {
  const _BellButton({required this.hasUnread, required this.onTap});

  final bool hasUnread;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: hasUnread ? l10n.notificationsUnread : l10n.notifications,
      child: GestureDetector(
        onTap: onTap,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 36,
              height: 36,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.amber12,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: context.palette.border, width: 0.5),
              ),
              child: const Icon(
                LucideIcons.bell,
                size: 24,
                color: AppColors.amber,
              ),
            ),
            if (hasUnread)
              PositionedDirectional(
                end: -2,
                top: 2,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: AppColors.amber,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
