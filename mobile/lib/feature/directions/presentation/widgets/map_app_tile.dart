import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// A map app to open the route in. The recommended one is outlined in teal.
class MapAppTile extends StatelessWidget {
  const MapAppTile({
    super.key,
    required this.name,
    required this.isRecommended,
    required this.onTap,
  });

  final String name;
  final bool isRecommended;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      label: isRecommended ? l10n.recommendedSemantics(name) : name,
      excludeSemantics: true,
      child: Material(
        color: palette.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: isRecommended ? AppColors.teal : palette.border,
            width: isRecommended ? 1.5 : 0.5,
          ),
        ),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: ConstrainedBox(
            constraints: const BoxConstraints(minHeight: 58),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isRecommended
                          ? AppColors.tealBg
                          : palette.surface2,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      LucideIcons.map,
                      size: 24,
                      color: palette.textPrimary,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          name,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: palette.textPrimary,
                          ),
                        ),
                        if (isRecommended) ...[
                          const SizedBox(height: 3),
                          Text(
                            l10n.recommended,
                            style: TextStyle(
                              fontSize: 10,
                              color: palette.textHint,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  Text(
                    l10n.forwardChevron,
                    textDirection: TextDirection.ltr,
                    style: TextStyle(fontSize: 18, color: palette.textHint),
                  ),
                  const SizedBox(width: 6),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
