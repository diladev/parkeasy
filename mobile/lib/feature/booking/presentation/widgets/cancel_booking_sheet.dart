import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/cubit/cancel_booking_cubit.dart';

/// Asks to confirm cancelling [booking], over the booking screen. Once
/// cancelled, it opens the cancellation screen.
Future<void> showCancelBookingSheet(BuildContext context, Booking booking) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: context.palette.surface,
    barrierColor: Colors.black.withValues(alpha: 0.6),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (_) => BlocProvider(
      create: (_) => sl<CancelBookingCubit>(),
      child: _CancelBookingSheet(booking: booking),
    ),
  );
}

class _CancelBookingSheet extends StatelessWidget {
  const _CancelBookingSheet({required this.booking});

  final Booking booking;

  /// What the refund will be, by the server's rule.
  String get _refundNote {
    final refund = booking.refundIfCancelledAt(DateTime.now());
    if (refund <= 0) {
      return 'Less than an hour of your booking is left, so there is '
          'no refund.';
    }
    final amount = Formatters.money(refund);
    if (refund >= booking.totalCost) {
      return "Free cancellation applies. You'll get a full refund of $amount "
          'back to your ParkEasy Wallet right away.';
    }
    return "You'll get $amount back to your ParkEasy Wallet for the hours "
        "you haven't used.";
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BlocConsumer<CancelBookingCubit, CancelBookingState>(
      listenWhen: (previous, current) =>
          current.status == CancelStatus.cancelled ||
          current.errorSerial != previous.errorSerial,
      listener: (context, state) {
        final cancellation = state.cancellation;
        if (cancellation != null) {
          AppRouter.toCancellationSuccess(context, cancellation);
        } else if (state.errorMessage != null) {
          // Shown on the booking screen: a snackbar would sit behind the sheet.
          context.showSnack(state.errorMessage!, isError: true);
          Navigator.pop(context);
        }
      },
      builder: (context, state) {
        final isCancelling = state.status != CancelStatus.idle;

        return SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(22, 12, 22, 22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 30,
                    height: 4,
                    decoration: BoxDecoration(
                      color: palette.border,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 18),
                const Icon(
                  LucideIcons.circleAlert200,
                  size: 64,
                  color: AppColors.red,
                ),
                const SizedBox(height: 12),
                Text(
                  'Cancel booking?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: palette.textPrimary,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Are you sure you want to cancel your booking at '
                  '${booking.lotName}, Slot ${booking.slotNumber}?',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.35,
                    color: palette.textHint,
                  ),
                ),
                const SizedBox(height: 18),
                _RefundNote(text: _refundNote),
                const SizedBox(height: 30),
                _SheetButton(
                  label: '✕  Yes, cancel booking',
                  background: AppColors.red,
                  foreground: Colors.white,
                  isBold: true,
                  height: 48,
                  isLoading: isCancelling,
                  onTap: isCancelling
                      ? null
                      : () => context.read<CancelBookingCubit>().cancel(
                          booking,
                        ),
                ),
                const SizedBox(height: 10),
                _SheetButton(
                  label: 'Keep my booking',
                  background: palette.surface,
                  foreground: palette.textMuted,
                  border: palette.border,
                  height: 46,
                  onTap: isCancelling ? null : () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _RefundNote extends StatelessWidget {
  const _RefundNote({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
      constraints: const BoxConstraints(minHeight: 52),
      decoration: BoxDecoration(
        color: AppColors.amber12,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.amber.withValues(alpha: 0.25),
          width: 0.5,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 10,
                height: 1.4,
                color: AppColors.amber,
              ),
            ),
          ),
          const SizedBox(width: 12),
          const Icon(LucideIcons.info, size: 24, color: AppColors.amber),
        ],
      ),
    );
  }
}

class _SheetButton extends StatelessWidget {
  const _SheetButton({
    required this.label,
    required this.background,
    required this.foreground,
    required this.height,
    required this.onTap,
    this.border,
    this.isBold = false,
    this.isLoading = false,
  });

  final String label;
  final Color background;
  final Color foreground;
  final Color? border;
  final double height;
  final bool isBold;
  final bool isLoading;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final edge = border;

    return Material(
      color: background,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: edge == null
            ? BorderSide.none
            : BorderSide(color: edge, width: 0.5),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: height,
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: foreground,
                    ),
                  )
                : Text(
                    label,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: isBold ? FontWeight.w500 : FontWeight.w400,
                      color: foreground,
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
