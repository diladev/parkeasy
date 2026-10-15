import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// "Gate QR code": where the code to open the gate goes.
class GateCodeTile extends StatelessWidget {
  const GateCodeTile({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 64,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: palette.border, width: 0.5),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: palette.surface2,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(LucideIcons.qrCode, size: 24, color: palette.textHint),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Gate QR code',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: palette.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Scan to enter or exit the lot',
                    style: TextStyle(fontSize: 10, color: palette.textHint),
                  ),
                ],
              ),
            ),
            Text('›', style: TextStyle(fontSize: 18, color: palette.textHint)),
            const SizedBox(width: 1),
          ],
        ),
      ),
    );
  }
}

/// Extend (teal) and Directions (outlined), side by side.
class BookingActionButtons extends StatelessWidget {
  const BookingActionButtons({
    super.key,
    required this.onExtend,
    required this.onDirections,
  });

  final VoidCallback onExtend;
  final VoidCallback onDirections;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Row(
      children: [
        Expanded(
          child: _ActionButton(
            icon: LucideIcons.clock9,
            label: 'Extend',
            background: AppColors.teal,
            // Light on teal in both themes.
            foreground: AppColors.textPrimary,
            isBold: true,
            onTap: onExtend,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _ActionButton(
            icon: LucideIcons.navigation,
            label: 'Directions',
            background: palette.surface,
            foreground: palette.textMuted,
            border: palette.border,
            onTap: onDirections,
          ),
        ),
      ],
    );
  }
}

class _ActionButton extends StatelessWidget {
  const _ActionButton({
    required this.icon,
    required this.label,
    required this.background,
    required this.foreground,
    required this.onTap,
    this.border,
    this.isBold = false,
  });

  final IconData icon;
  final String label;
  final Color background;
  final Color foreground;
  final Color? border;
  final bool isBold;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final edge = border;

    return Material(
      color: background,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: edge == null
            ? BorderSide.none
            : BorderSide(color: edge, width: 0.5),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: 46,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 12, color: foreground),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isBold ? FontWeight.w500 : FontWeight.w400,
                  color: foreground,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// "✕  Cancel booking", in red.
class CancelBookingButton extends StatelessWidget {
  const CancelBookingButton({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.red12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppColors.red.withValues(alpha: 0.2),
          width: 0.5,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: const SizedBox(
          height: 44,
          child: Center(
            child: Text(
              '✕  Cancel booking',
              style: TextStyle(fontSize: 12, color: AppColors.red),
            ),
          ),
        ),
      ),
    );
  }
}
