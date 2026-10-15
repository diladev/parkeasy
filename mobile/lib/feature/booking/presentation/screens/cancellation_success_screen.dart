import 'package:flutter/material.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/cancellation.dart';

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
              'Booking cancelled',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w500,
                color: palette.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              refunded
                  ? 'Your booking has been cancelled\n'
                        'and your refund is in your wallet.'
                  : 'Your booking has been cancelled.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                height: 1.35,
                color: palette.textHint,
              ),
            ),
            const SizedBox(height: 16),
            _DetailsCard(
              rows: [
                ('Location', booking.lotName, false),
                ('Slot', booking.slotLabel, false),
                (
                  'Cancelled at',
                  '${Formatters.time(cancelledAt)} · '
                      '${Formatters.day(cancelledAt)}',
                  false,
                ),
                (
                  'Refund amount',
                  Formatters.money(cancellation.refund),
                  true,
                ),
              ],
              afterDivider: refunded
                  ? const [
                      ('Refund to', 'ParkEasy Wallet', false),
                      ('Estimated', 'Instant', false),
                    ]
                  : const [],
            ),
            const SizedBox(height: 20),
            AppButton(
              label: 'Find another spot',
              height: 48,
              onTap: () => AppRouter.toHome(context, tab: AppRouter.mapTab),
            ),
            const SizedBox(height: 10),
            Material(
              color: palette.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
                side: BorderSide(color: palette.border, width: 0.5),
              ),
              child: InkWell(
                onTap: () => AppRouter.toHome(context),
                borderRadius: BorderRadius.circular(12),
                child: SizedBox(
                  height: 46,
                  child: Center(
                    child: Text(
                      'Back to home',
                      style: TextStyle(fontSize: 13, color: palette.textMuted),
                    ),
                  ),
                ),
              ),
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

/// Label/value lines, with a divider before [afterDivider].
/// The third field highlights the value in teal.
class _DetailsCard extends StatelessWidget {
  const _DetailsCard({required this.rows, required this.afterDivider});

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
