import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The lot's features as small tags: CCTV, EV charge, Covered, Accessible.
class LotFeatureTags extends StatelessWidget {
  const LotFeatureTags({super.key, required this.labels});

  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Wrap(
      spacing: 14,
      runSpacing: 8,
      children: [
        for (final label in labels)
          Container(
            height: 26,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: palette.surface,
              borderRadius: BorderRadius.circular(7),
              border: Border.all(color: palette.border, width: 0.5),
            ),
            child: Text(
              label,
              style: TextStyle(fontSize: 9, color: palette.textMuted),
            ),
          ),
      ],
    );
  }
}
