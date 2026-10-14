import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// One of the four boxes under the header: a value and what it means.
class LotStatTile extends StatelessWidget {
  const LotStatTile({
    super.key,
    required this.value,
    required this.label,
    this.isHighlighted = false,
  });

  final String value;
  final String label;

  /// Drawn in teal (the free slots count).
  final bool isHighlighted;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 60,
      padding: const EdgeInsets.fromLTRB(4, 14, 4, 0),
      decoration: BoxDecoration(
        color: isHighlighted ? AppColors.tealBg : palette.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isHighlighted ? AppColors.teal : palette.border,
          width: isHighlighted ? 1 : 0.5,
        ),
      ),
      child: Column(
        children: [
          SizedBox(
            height: 20,
            child: FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: isHighlighted
                      ? AppColors.tealLight
                      : palette.textPrimary,
                ),
              ),
            ),
          ),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 9, color: palette.textHint),
          ),
        ],
      ),
    );
  }
}
