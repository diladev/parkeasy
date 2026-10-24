import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/cubit/cancel_booking_cubit.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_sheet.dart';

/// Asks to confirm cancelling [booking], over the booking screen. Only offered
/// during the free cancellation window. Once cancelled, it opens the
/// cancellation screen.
Future<void> showCancelBookingSheet(BuildContext context, Booking booking) {
  return showBookingSheet(
    context,
    (_) => BlocProvider(
      create: (_) => sl<CancelBookingCubit>(),
      child: _CancelBookingSheet(booking: booking),
    ),
  );
}

class _CancelBookingSheet extends StatelessWidget {
  const _CancelBookingSheet({required this.booking});

  final Booking booking;

  String get _refundNote {
    final refund = booking.cancellationRefund;
    if (refund <= 0) {
      return "Free cancellation applies. This booking was paid by card, so "
          "there's nothing to refund to your wallet.";
    }
    return "Free cancellation applies. You'll get a full refund of "
        '${Formatters.money(refund)} back to your ParkEasy Wallet right away.';
  }

  @override
  Widget build(BuildContext context) {
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
          // (Also when the window closed while the sheet was open.)
          context.showSnack(state.errorMessage!, isError: true);
          Navigator.pop(context);
        }
      },
      builder: (context, state) => BookingSheet(
        icon: LucideIcons.circleAlert200,
        title: 'Cancel booking?',
        message:
            'Are you sure you want to cancel your booking at '
            '${booking.lotName}, Slot ${booking.slotNumber}?',
        note: _refundNote,
        confirmLabel: '✕  Yes, cancel booking',
        backLabel: 'Keep my booking',
        isBusy: state.status != CancelStatus.idle,
        onConfirm: () => context.read<CancelBookingCubit>().cancel(booking),
      ),
    );
  }
}
