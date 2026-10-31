import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/widgets/result_parts.dart';

/// The driver ended their parking early: when they parked, what they booked
/// and what was charged (all of it: ending early isn't refunded).
///
/// Leaving this screen goes to a fresh home, so every list shows the change.
class ParkingEndedScreen extends StatelessWidget {
  const ParkingEndedScreen({super.key, required this.booking});

  /// The finished booking, as the server returned it.
  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final hours = l10n.hoursLong(booking.durationHours);

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) AppRouter.toHome(context);
      },
      child: AppScreen(
        body: ListView(
          padding: const EdgeInsets.fromLTRB(22, 80, 22, 24),
          children: [
            const Center(child: _EndedBadge()),
            const SizedBox(height: 16),
            Text(
              l10n.parkingEnded,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w500,
                color: palette.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              l10n.slotFreeThanks,
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
                  l10n.parked,
                  Formatters.bookingTime(booking.startTime, booking.finishedAt),
                  false,
                ),
                (l10n.booked, hours, false),
              ],
              afterDivider: [
                (l10n.charged, Formatters.money(booking.totalCost), true),
                (
                  l10n.paidWith,
                  booking.isPaidFromWallet ? l10n.parkEasyWallet : l10n.card,
                  false,
                ),
              ],
            ),
            const SizedBox(height: 20),
            AppButton(
              label: l10n.viewReceipt,
              height: 48,
              onTap: () => AppRouter.toBookingReceipt(context, booking.id),
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

class _EndedBadge extends StatelessWidget {
  const _EndedBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      height: 80,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.teal.withValues(alpha: 0.12),
        shape: BoxShape.circle,
        border: Border.all(
          color: AppColors.teal.withValues(alpha: 0.3),
          width: 1.5,
        ),
      ),
      child: const Icon(
        LucideIcons.check,
        size: 36,
        color: AppColors.tealLight,
      ),
    );
  }
}
