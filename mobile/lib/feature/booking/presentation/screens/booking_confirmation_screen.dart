import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_summary_card.dart';

/// Step 3 of booking: the booking went through.
///
/// Leaving this screen (back, or "Back to home") goes to a fresh home tab, so
/// home shows the new booking and the slot counts without it.
class BookingConfirmationScreen extends StatelessWidget {
  const BookingConfirmationScreen({super.key, required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final duration = booking.durationHours == 1
        ? '1 hour'
        : '${booking.durationHours} hours';

    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) AppRouter.toHome(context);
      },
      child: Scaffold(
        body: SafeArea(
          child: ListView(
            padding: const EdgeInsets.fromLTRB(22, 70, 22, 24),
            children: [
              const Center(child: _SuccessBadge()),
              const SizedBox(height: 18),
              Text(
                'Booking confirmed!',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: context.palette.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Your spot is reserved. Head there anytime.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: context.palette.textHint),
              ),
              const SizedBox(height: 14),
              BookingSummaryCard(
                valueColumn: 186,
                rowHeight: 22,
                lastRowHeight: 16,
                topPadding: 12,
                rows: [
                  SummaryRow(
                    'Location',
                    SummaryRow.text(context, booking.lotName),
                  ),
                  SummaryRow(
                    'Slot',
                    SummaryRow.text(context, booking.slotLabel),
                  ),
                  SummaryRow(
                    'Vehicle',
                    SummaryRow.text(context, booking.vehicleLabel),
                  ),
                  SummaryRow(
                    'Date & time',
                    SummaryRow.text(
                      context,
                      Formatters.dayAndTime(booking.startTime),
                    ),
                  ),
                  SummaryRow('Duration', SummaryRow.text(context, duration)),
                ],
                totalLabel: 'Paid',
                total: Formatters.money(booking.totalCost),
              ),
              const SizedBox(height: 18),
              const _GateCodeCard(),
              const SizedBox(height: 18),
              AppButton(
                label: 'View my booking',
                height: 48,
                onTap: () =>
                    AppRouter.toBookingDetail(context, '${booking.id}'),
              ),
              const SizedBox(height: 18),
              _SecondaryButton(
                label: 'Back to home',
                onTap: () => AppRouter.toHome(context),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SuccessBadge extends StatelessWidget {
  const _SuccessBadge();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 80,
      height: 80,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.tealBg,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.teal, width: 1.5),
      ),
      child: const Icon(
        LucideIcons.check200,
        size: 44,
        color: AppColors.tealLight,
      ),
    );
  }
}

/// Where the gate code goes. There's no gate scanning yet, so it shows the
/// design's placeholder icon rather than a real QR code.
class _GateCodeCard extends StatelessWidget {
  const _GateCodeCard();

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 104,
      padding: const EdgeInsets.only(top: 14),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Column(
        children: [
          Text(
            'Booking QR code',
            style: TextStyle(fontSize: 10, color: palette.textHint),
          ),
          const SizedBox(height: 3),
          Container(
            width: 70,
            height: 50,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: palette.surface2,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              LucideIcons.scanQrCode300,
              size: 32,
              color: palette.textMuted,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Scan at the gate to enter',
            style: TextStyle(fontSize: 9, color: palette.textHint),
          ),
        ],
      ),
    );
  }
}

class _SecondaryButton extends StatelessWidget {
  const _SecondaryButton({required this.label, required this.onTap});

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
