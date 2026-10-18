import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/wallet/domain/entities/wallet_transaction.dart';

/// One line of the wallet history: what it was for, when, and how much.
class WalletTransactionRow extends StatelessWidget {
  const WalletTransactionRow({super.key, required this.transaction});

  final WalletTransaction transaction;

  /// "City Center Parking" for a booking, otherwise "Wallet top-up".
  String get _title => transaction.lotName ?? transaction.description;

  /// "Today · 9:15 AM", plus what it was when the title is a lot.
  String get _subtitle {
    final when = Formatters.dayAndTime(transaction.createdAt);
    return transaction.lotName == null
        ? when
        : '$when · ${transaction.description}';
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final amount = Formatters.money(transaction.amount);

    return Padding(
      padding: const EdgeInsets.only(top: 6, bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(top: 2),
            child: _CategoryIcon(category: transaction.category),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 11,
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
          const SizedBox(width: 12),
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Text(
              transaction.isCredit ? '+$amount' : '-$amount',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: transaction.isCredit
                    ? AppColors.tealLight
                    : AppColors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryIcon extends StatelessWidget {
  const _CategoryIcon({required this.category});

  final WalletTransactionCategory category;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (Color background, Widget icon) = switch (category) {
      // The blue parking sign.
      WalletTransactionCategory.bookingPayment ||
      WalletTransactionCategory.bookingExtension => (
        AppColors.blue35,
        Text('P', style: TextStyle(fontSize: 24, color: palette.textPrimary)),
      ),
      WalletTransactionCategory.topUp => (
        AppColors.tealBg,
        const Icon(LucideIcons.plus, size: 24, color: AppColors.teal),
      ),
      WalletTransactionCategory.bookingRefund => (
        AppColors.tealBg,
        const Icon(LucideIcons.rotateCcw, size: 24, color: AppColors.teal),
      ),
      WalletTransactionCategory.other => (
        palette.surface2,
        Icon(LucideIcons.wallet, size: 24, color: palette.textMuted),
      ),
    };

    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(10),
      ),
      child: icon,
    );
  }
}
