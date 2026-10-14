import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The green band at the top: back link, lot name, address and distance.
class ParkingDetailsHeader extends StatelessWidget {
  const ParkingDetailsHeader({
    super.key,
    required this.name,
    required this.addressLine,
    required this.onBack,
  });

  final String name;

  /// "14 Rashid St, downtown · 0.3 km"
  final String addressLine;
  final VoidCallback onBack;

  static const Color _darkBackground = Color(0xFF0A1F19);

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      height: 90,
      color: isDark ? _darkBackground : AppColors.tealBg,
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          BackToMapLink(onTap: onBack),
          const SizedBox(height: 7),
          Text(
            name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: palette.textPrimary,
            ),
          ),
          const SizedBox(height: 5),
          Row(
            children: [
              const Icon(LucideIcons.mapPin300, size: 16, color: AppColors.red),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  addressLine,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    color: AppColors.tealLight,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// "← Back to map", also shown while the lot is loading or failed to load.
class BackToMapLink extends StatelessWidget {
  const BackToMapLink({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Text(
        '← Back to map',
        style: TextStyle(fontSize: 11, color: context.palette.textMuted),
      ),
    );
  }
}
