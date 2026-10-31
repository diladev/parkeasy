import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/cubit/end_parking_cubit.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_sheet.dart';

/// Asks to confirm ending [booking] now, over the booking screen. Offered
/// once the free cancellation window is over. Once ended, it opens the
/// "Parking ended" screen.
Future<void> showEndParkingSheet(BuildContext context, Booking booking) {
  return showBookingSheet(
    context,
    (_) => BlocProvider(
      create: (_) => sl<EndParkingCubit>(),
      child: _EndParkingSheet(booking: booking),
    ),
  );
}

class _EndParkingSheet extends StatelessWidget {
  const _EndParkingSheet({required this.booking});

  final Booking booking;

  /// "You've parked 1h 22m of your 3 hours at City Center, Slot A4."
  String get _message {
    final parked = DateTime.now().difference(booking.startTime);
    return l10n.parkedSoFar(
      Formatters.duration(parked.isNegative ? Duration.zero : parked),
      l10n.hoursLong(booking.durationHours),
      booking.lotName,
      booking.slotNumber,
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<EndParkingCubit, EndParkingState>(
      listenWhen: (previous, current) =>
          current.status == EndParkingStatus.ended ||
          current.errorSerial != previous.errorSerial,
      listener: (context, state) {
        final ended = state.booking;
        if (ended != null) {
          AppRouter.toParkingEnded(context, ended);
        } else if (state.errorMessage != null) {
          // Shown on the booking screen: a snackbar would sit behind the sheet.
          context.showSnack(state.errorMessage!, isError: true);
          Navigator.pop(context);
        }
      },
      builder: (context, state) => BookingSheet(
        icon: LucideIcons.circleStop200,
        title: l10n.endParkingQuestion,
        message: _message,
        note: l10n.endingEarlyNote(Formatters.money(booking.totalCost)),
        confirmLabel: l10n.endParking,
        confirmIcon: LucideIcons.circleStop,
        backLabel: l10n.keepParking,
        isBusy: state.status != EndParkingStatus.idle,
        onConfirm: () => context.read<EndParkingCubit>().end(booking),
      ),
    );
  }
}
