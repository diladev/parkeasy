import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// A rounded chip under the search box: Nearest, Price, EV, Covered.
class SearchChip extends StatelessWidget {
  const SearchChip({
    super.key,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      selected: isSelected,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          height: 24,
          padding: const EdgeInsets.symmetric(horizontal: 20),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.tealBg : palette.surface,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? AppColors.teal : palette.border,
              width: 0.5,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 9,
              color: isSelected ? AppColors.tealLight : palette.textMuted,
            ),
          ),
        ),
      ),
    );
  }
}
