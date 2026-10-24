import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The details card of a result screen (cancelled, parking ended): label/value
/// lines, with a divider before [afterDivider]. The third field highlights the
/// value in teal.
class ResultDetailsCard extends StatelessWidget {
  const ResultDetailsCard({
    super.key,
    required this.rows,
    this.afterDivider = const [],
  });

  final List<(String, String, bool)> rows;
  final List<(String, String, bool)> afterDivider;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    Widget line((String, String, bool) row) {
      final (label, value, isHighlighted) = row;
      return SizedBox(
        height: 22,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 172,
              child: Text(
                label,
                style: TextStyle(fontSize: 10, color: palette.textHint),
              ),
            ),
            Expanded(
              child: Text(
                value,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: isHighlighted ? FontWeight.w500 : FontWeight.w400,
                  color: isHighlighted
                      ? AppColors.tealLight
                      : palette.textPrimary,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 6),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Column(
        children: [
          for (final row in rows) line(row),
          if (afterDivider.isNotEmpty) ...[
            Divider(height: 1, thickness: 1, color: palette.border),
            const SizedBox(height: 3),
            for (final row in afterDivider) line(row),
          ],
        ],
      ),
    );
  }
}

/// The outlined button under a result screen's main action ("Back to home").
class ResultSecondaryButton extends StatelessWidget {
  const ResultSecondaryButton({
    super.key,
    required this.label,
    required this.onTap,
  });

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Material(
      color: palette.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: palette.border, width: 0.5),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: 46,
          child: Center(
            child: Text(
              label,
              style: TextStyle(fontSize: 13, color: palette.textMuted),
            ),
          ),
        ),
      ),
    );
  }
}
