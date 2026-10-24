import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/cubit/booking_detail_cubit.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_actions.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_info_card.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_status_banner.dart';
import 'package:mobile/feature/booking/presentation/widgets/cancel_booking_sheet.dart';
import 'package:mobile/feature/booking/presentation/widgets/end_parking_sheet.dart';

/// One booking: its status, details, and (while active) the gate code,
/// Extend, Directions and Cancel or End parking; once it's over, its receipt.
class BookingDetailScreen extends StatelessWidget {
  const BookingDetailScreen({super.key, required this.bookingId});

  final int bookingId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<BookingDetailCubit>()..load(bookingId),
      child: AppScreen(
        topBar: const AppTopBar(title: 'Booking details'),
        body: _BookingDetailView(bookingId: bookingId),
      ),
    );
  }
}

class _BookingDetailView extends StatelessWidget {
  const _BookingDetailView({required this.bookingId});

  final int bookingId;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<BookingDetailCubit>();

    return BlocConsumer<BookingDetailCubit, BookingDetailState>(
      // A refresh that failed while the booking is on screen.
      listenWhen: (previous, current) =>
          current.booking != null &&
          current.errorMessage != null &&
          current.errorMessage != previous.errorMessage,
      listener: (context, state) =>
          context.showSnack(state.errorMessage!, isError: true),
      builder: (context, state) {
        final booking = state.booking;
        if (booking != null) return _BookingDetails(booking: booking);
        if (state.status == BookingDetailStatus.failure) {
          return AppErrorView(
            message: state.errorMessage ?? "Couldn't load this booking.",
            onRetry: () => cubit.load(bookingId),
          );
        }
        return const Center(child: CircularProgressIndicator());
      },
    );
  }
}

class _BookingDetails extends StatelessWidget {
  const _BookingDetails({required this.booking});

  final Booking booking;

  /// Opens a screen about this booking, then reloads it: extending or
  /// cancelling changes it.
  Future<void> _openAndReload(
    BuildContext context,
    Future<void> Function() open,
  ) async {
    final cubit = context.read<BookingDetailCubit>();
    await open();
    await cubit.load(booking.id);
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<BookingDetailCubit>();

    return RefreshIndicator(
      color: AppColors.teal,
      onRefresh: () => cubit.load(booking.id),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
        children: [
          BookingStatusBanner(booking: booking),
          const SizedBox(height: 14),
          BookingInfoCard(
            rows: [
              ('Location', booking.lotName),
              ('Slot', booking.slotLabel),
              ('Vehicle', booking.vehicleLabel),
              ('Start time', Formatters.dayAndTime(booking.startTime)),
              ('Rate', '${Formatters.money(booking.pricePerHour)} / hr'),
            ],
          ),
          if (booking.isActive) ...[
            const SizedBox(height: 14),
            GateCodeTile(
              onTap: () => context.showSnack(
                "Gate QR codes aren't available yet.",
              ),
            ),
            const SizedBox(height: 14),
            BookingActionButtons(
              onExtend: () => _openAndReload(
                context,
                () => AppRouter.toExtendParking(context, booking),
              ),
              onDirections: () =>
                  AppRouter.toDirections(
                    context,
                    booking.lotId,
                    slotLabel: 'Slot ${booking.slotNumber}',
                  ),
            ),
            const SizedBox(height: 12),
            CancelOrEndParking(
              booking: booking,
              onCancel: () => showCancelBookingSheet(context, booking),
              onEnd: () => showEndParkingSheet(context, booking),
            ),
          ] else ...[
            const SizedBox(height: 14),
            AppOutlinedButton(
              label: 'View receipt',
              icon: LucideIcons.receipt,
              height: 46,
              onTap: () => AppRouter.toBookingReceipt(context, booking.id),
            ),
          ],
        ],
      ),
    );
  }
}
