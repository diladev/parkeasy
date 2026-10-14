import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// One of the four shortcuts under the search bar: a 56px icon tile and a label.
class QuickActionButton extends StatelessWidget {
  const QuickActionButton({
    super.key,
    required this.icon,
    required this.label,
    required this.onTap,
    this.isPrimary = false,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  /// The main action, drawn in teal.
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final foreground = isPrimary ? AppColors.tealLight : palette.textMuted;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 72,
        child: Column(
          children: [
            Container(
              width: 56,
              height: 56,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: isPrimary ? AppColors.tealDim : palette.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isPrimary ? AppColors.tealLight : palette.border,
                  width: isPrimary ? 1 : 0.5,
                ),
              ),
              child: Icon(icon, size: 32, color: foreground),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: 10, color: foreground),
            ),
          ],
        ),
      ),
    );
  }
}
