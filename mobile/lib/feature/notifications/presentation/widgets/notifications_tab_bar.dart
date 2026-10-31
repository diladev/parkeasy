import 'package:flutter/material.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/notifications/presentation/cubit/notifications_state.dart';

/// "All | Bookings | Wallet" under the top bar, underlined in teal.
class NotificationsTabBar extends StatelessWidget {
  const NotificationsTabBar({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  final NotificationsTab selected;
  final ValueChanged<NotificationsTab> onSelected;

  static Map<NotificationsTab, String> get _labels => {
    NotificationsTab.all: l10n.tabAll,
    NotificationsTab.bookings: l10n.tabBookings,
    NotificationsTab.wallet: l10n.tabWallet,
  };

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 44,
      padding: const EdgeInsetsDirectional.only(start: 22),
      decoration: BoxDecoration(
        color: palette.bg,
        border: Border(bottom: BorderSide(color: palette.border, width: 0.5)),
      ),
      child: Row(
        children: [
          for (final tab in NotificationsTab.values)
            _Tab(
              label: _labels[tab]!,
              isSelected: tab == selected,
              onTap: () => onSelected(tab),
            ),
        ],
      ),
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: isSelected,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: SizedBox(
          width: 118,
          height: 44,
          child: Stack(
            children: [
              PositionedDirectional(
                start: 0,
                top: 14,
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: isSelected ? FontWeight.w500 : FontWeight.w400,
                    color: isSelected
                        ? AppColors.teal
                        : context.palette.textHint,
                  ),
                ),
              ),
              if (isSelected)
                PositionedDirectional(
                  start: 0,
                  top: 40,
                  child: Container(
                    width: 60,
                    height: 2,
                    decoration: BoxDecoration(
                      color: AppColors.teal,
                      borderRadius: BorderRadius.circular(1),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
