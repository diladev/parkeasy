import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/booking/presentation/cubit/my_bookings_state.dart';

/// "Active | History" under the My bookings header, underlined in teal.
class BookingsTabBar extends StatelessWidget {
  const BookingsTabBar({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  final BookingsTab selected;
  final ValueChanged<BookingsTab> onSelected;

  static const Map<BookingsTab, String> _labels = {
    BookingsTab.active: 'Active',
    BookingsTab.history: 'History',
  };

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 44,
      padding: const EdgeInsets.only(left: 22),
      decoration: BoxDecoration(
        color: palette.bg,
        border: Border(bottom: BorderSide(color: palette.border, width: 0.5)),
      ),
      child: Row(
        children: [
          for (final tab in BookingsTab.values)
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
          width: 116,
          height: 44,
          child: Stack(
            children: [
              Positioned(
                left: 0,
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
                Positioned(
                  left: 0,
                  top: 40,
                  child: Container(
                    width: 50,
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
