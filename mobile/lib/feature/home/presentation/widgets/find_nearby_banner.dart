import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// "Find nearby spot" with the number of free slots around the user.
class FindNearbyBanner extends StatelessWidget {
  const FindNearbyBanner({
    super.key,
    required this.isLoading,
    required this.spotsNearby,
    required this.onFind,
  });

  final bool isLoading;

  /// Null when the count couldn't be loaded.
  final int? spotsNearby;
  final VoidCallback onFind;

  String get _subtitle {
    if (isLoading) return 'Looking for spots near you...';
    final spots = spotsNearby;
    if (spots == null) return "Couldn't check spots near you";
    if (spots == 0) return 'No free spots near you right now';
    return spots == 1 ? '1 spot available near you' : '$spots spots available near you';
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 58,
      padding: const EdgeInsets.only(left: 14, right: 10),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Row(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(top: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Find nearby spot',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: palette.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    _subtitle,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 10, color: palette.textHint),
                  ),
                ],
              ),
            ),
          ),
          GestureDetector(
            onTap: onFind,
            child: Container(
              width: 80,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.tealDim,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.tealLight, width: 0.5),
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(LucideIcons.compass300, size: 16, color: AppColors.tealLight),
                  SizedBox(width: 5),
                  Text(
                    'Find',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: AppColors.tealLight,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
