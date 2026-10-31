import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// "Search area..." over the map, with the locate-me button on the right.
class MapSearchBar extends StatelessWidget {
  const MapSearchBar({
    super.key,
    required this.onSearch,
    required this.onLocate,
    required this.isLocating,
  });

  final VoidCallback onSearch;
  final VoidCallback onLocate;
  final bool isLocating;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border, width: 0.5),
        boxShadow: const [
          BoxShadow(
            color: Color(0x40000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Semantics(
              button: true,
              label: l10n.searchArea,
              excludeSemantics: true,
              child: GestureDetector(
                onTap: onSearch,
                behavior: HitTestBehavior.opaque,
                child: Padding(
                  padding: const EdgeInsetsDirectional.only(start: 14),
                  child: Row(
                    children: [
                      Icon(
                        LucideIcons.search600,
                        size: 14,
                        color: palette.textHint,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        l10n.searchAreaHint,
                        style: TextStyle(fontSize: 12, color: palette.textHint),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Semantics(
            button: true,
            label: l10n.showMyLocation,
            excludeSemantics: true,
            child: GestureDetector(
              onTap: onLocate,
              behavior: HitTestBehavior.opaque,
              child: SizedBox(
                width: 44,
                height: 40,
                child: Center(
                  child: isLocating
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text(
                          '◎',
                          style: TextStyle(fontSize: 14, color: AppColors.teal),
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
