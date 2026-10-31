import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// Looks like a search field; tapping it opens the search screen.
class HomeSearchBar extends StatelessWidget {
  const HomeSearchBar({
    super.key,
    required this.onSearch,
    required this.onFilters,
  });

  final VoidCallback onSearch;
  final VoidCallback onFilters;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return GestureDetector(
      onTap: onSearch,
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 44,
        padding: const EdgeInsetsDirectional.only(start: 9, end: 6),
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: palette.border, width: 0.5),
        ),
        child: Row(
          children: [
            Icon(LucideIcons.search600, size: 16, color: palette.textHint),
            const SizedBox(width: 5),
            Expanded(
              child: Text(
                l10n.searchParkingSpots,
                style: TextStyle(fontSize: 12, color: palette.textHint),
              ),
            ),
            GestureDetector(
              onTap: onFilters,
              child: Container(
                width: 30,
                height: 30,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.purple35,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: palette.border, width: 0.5),
                ),
                child: const Icon(
                  LucideIcons.settings2600,
                  size: 16,
                  color: AppColors.purple,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
