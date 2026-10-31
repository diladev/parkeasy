import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// `[−] 2 hours [+]` for the Duration line of the summary.
///
/// The buttons look 32×32 but each takes a 48×48 tap area (Material's
/// minimum), and the hours sit between them so − and + are far apart.
class DurationStepper extends StatelessWidget {
  const DurationStepper({
    super.key,
    required this.hours,
    required this.onDecrease,
    required this.onIncrease,
  });

  final int hours;

  /// Null at the shortest or longest booking.
  final VoidCallback? onDecrease;
  final VoidCallback? onIncrease;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _StepButton(
          icon: LucideIcons.minus,
          label: l10n.oneHourLess,
          onTap: onDecrease,
        ),
        SizedBox(
          width: 56,
          child: Text(
            l10n.hoursLong(hours),
            textAlign: TextAlign.center,
            maxLines: 1,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: context.palette.textPrimary,
            ),
          ),
        ),
        _StepButton(
          icon: LucideIcons.plus,
          label: l10n.oneHourMore,
          onTap: onIncrease,
        ),
      ],
    );
  }
}

class _StepButton extends StatelessWidget {
  const _StepButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      enabled: onTap != null,
      label: label,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: SizedBox.square(
          dimension: 48,
          child: Center(
            child: Opacity(
              opacity: onTap == null ? 0.35 : 1,
              child: Container(
                width: 32,
                height: 32,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: palette.surface2,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: palette.border, width: 0.5),
                ),
                child: Icon(icon, size: 16, color: palette.textPrimary),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
