import 'package:flutter/material.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/cancellation.dart';
import 'package:mobile/feature/booking/presentation/widgets/result_parts.dart';

/// The booking was cancelled: what was refunded and where.
///
/// Leaving this screen goes to a fresh home, so every list shows the change.
class CancellationSuccessScreen extends StatelessWidget {
  const CancellationSuccessScreen({super.key, required this.cancellation});

  final Cancellation cancellation;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final booking = cancellation.booking;
    final refunded = cancellation.refund > 0;
    final cancelledAt = cancellation.cancelledAt;

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) AppRouter.toHome(context);
      },
      child: AppScreen(
        body: ListView(
          padding: const EdgeInsets.fromLTRB(22, 80, 22, 24),
          children: [
            const Center(child: _CancelledBadge()),
            const SizedBox(height: 16),
            Text(
              l10n.bookingCancelled,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w500,
                color: palette.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              refunded ? l10n.cancelledAndRefunded : l10n.bookingWasCancelled,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                height: 1.35,
                color: palette.textHint,
              ),
            ),
            const SizedBox(height: 16),
            ResultDetailsCard(
              rows: [
                (l10n.location, booking.lotName, false),
                (l10n.slot, booking.slotLabel, false),
                (
                  l10n.cancelledAt,
                  '${Formatters.time(cancelledAt)} · '
                      '${Formatters.day(cancelledAt)}',
                  false,
                ),
                (
                  l10n.refundAmount,
                  Formatters.money(cancellation.refund),
                  true,
                ),
              ],
              afterDivider: refunded
                  ? [
                      (l10n.refundTo, l10n.parkEasyWallet, false),
                      (l10n.estimated, l10n.instant, false),
                    ]
                  : const [],
            ),
            const SizedBox(height: 20),
            AppButton(
              label: l10n.findAnotherSpot,
              height: 48,
              onTap: () => AppRouter.toHome(context, tab: AppRouter.mapTab),
            ),
            const SizedBox(height: 10),
            ResultSecondaryButton(
              label: l10n.backToHome,
              onTap: () => AppRouter.toHome(context),
            ),
          ],
        ),
      ),
    );
  }
}

class _CancelledBadge extends StatelessWidget {
  const _CancelledBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      height: 80,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.red12,
        shape: BoxShape.circle,
        border: Border.all(
          color: AppColors.red.withValues(alpha: 0.3),
          width: 1.5,
        ),
      ),
      child: const Text(
        '✕',
        style: TextStyle(
          fontSize: 38,
          fontWeight: FontWeight.w700,
          color: AppColors.red,
        ),
      ),
    );
  }
}
