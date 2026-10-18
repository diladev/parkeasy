import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';

/// The green card at the top of the wallet: the balance and two actions.
class BalanceCard extends StatelessWidget {
  const BalanceCard({
    super.key,
    required this.balance,
    required this.onTopUp,
    required this.onWithdraw,
  });

  /// Whole Iraqi dinars.
  final int balance;
  final VoidCallback onTopUp;
  final VoidCallback onWithdraw;

  @override
  Widget build(BuildContext context) {
    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        gradient: const LinearGradient(
          colors: [AppColors.tealDim, AppColors.teal],
        ),
      ),
      child: Stack(
        children: [
          // The faint circle in the top-right corner.
          Positioned(
            right: -60,
            top: -30,
            child: Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.04),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Available balance',
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.white.withValues(alpha: 0.65),
                  ),
                ),
                const SizedBox(height: 8),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    Formatters.money(balance),
                    style: const TextStyle(
                      fontSize: 30,
                      height: 1.2,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    _CardChip(
                      label: '+ Top up',
                      background: Colors.white.withValues(alpha: 0.18),
                      textColor: Colors.white,
                      fontWeight: FontWeight.w500,
                      onTap: onTopUp,
                    ),
                    const SizedBox(width: 8),
                    _CardChip(
                      label: '↑ Withdraw',
                      background: Colors.white.withValues(alpha: 0.12),
                      textColor: Colors.white.withValues(alpha: 0.8),
                      fontWeight: FontWeight.w400,
                      onTap: onWithdraw,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CardChip extends StatelessWidget {
  const _CardChip({
    required this.label,
    required this.background,
    required this.textColor,
    required this.fontWeight,
    required this.onTap,
  });

  final String label;
  final Color background;
  final Color textColor;
  final FontWeight fontWeight;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          constraints: const BoxConstraints(minWidth: 80, minHeight: 26),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: fontWeight,
              color: textColor,
            ),
          ),
        ),
      ),
    );
  }
}
