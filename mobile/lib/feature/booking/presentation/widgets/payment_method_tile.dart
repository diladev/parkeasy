import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// A way to pay: icon, name, a detail line and a radio dot.
class PaymentMethodTile extends StatelessWidget {
  const PaymentMethodTile({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.subtitleColor,
    required this.isSelected,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String? subtitle;

  /// Defaults to the hint color.
  final Color? subtitleColor;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final detail = subtitle;

    return Semantics(
      button: true,
      selected: isSelected,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          height: 60,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: palette.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? AppColors.teal : palette.border,
              width: isSelected ? 1.5 : 0.5,
            ),
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.tealBg : palette.surface2,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 24, color: palette.textPrimary),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Container(
                  alignment: AlignmentDirectional.topStart,
                  padding: const EdgeInsets.only(top: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: palette.textPrimary,
                        ),
                      ),
                      if (detail != null) ...[
                        const SizedBox(height: 3),
                        Text(
                          detail,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 10,
                            color: subtitleColor ?? palette.textHint,
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              _RadioDot(isSelected: isSelected),
              const SizedBox(width: 2),
            ],
          ),
        ),
      ),
    );
  }
}

class _RadioDot extends StatelessWidget {
  const _RadioDot({required this.isSelected});

  final bool isSelected;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      width: 22,
      height: 22,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: palette.bg,
        shape: BoxShape.circle,
        border: Border.all(
          color: isSelected ? AppColors.teal : palette.border,
          width: 1.5,
        ),
      ),
      child: isSelected
          ? Container(
              width: 14,
              height: 14,
              decoration: const BoxDecoration(
                color: AppColors.teal,
                shape: BoxShape.circle,
              ),
            )
          : null,
    );
  }
}
