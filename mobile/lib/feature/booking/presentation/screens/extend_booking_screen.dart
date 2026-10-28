import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/presentation/cubit/extend_booking_cubit.dart';
import 'package:mobile/feature/booking/presentation/widgets/price_note.dart';

/// Adds hours to an active booking, paid from the wallet.
///
/// Closes with true once extended, so the booking screen reloads.
class ExtendBookingScreen extends StatelessWidget {
  const ExtendBookingScreen({super.key, required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<ExtendBookingCubit>(param1: booking)..load(),
      child: const AppScreen(
        topBar: AppTopBar(title: 'Extend parking'),
        body: _ExtendView(),
      ),
    );
  }
}

class _ExtendView extends StatelessWidget {
  const _ExtendView();

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ExtendBookingCubit, ExtendBookingState>(
      listenWhen: (previous, current) =>
          current.status == ExtendStatus.saved ||
          current.errorSerial != previous.errorSerial,
      listener: (context, state) {
        if (state.status == ExtendStatus.saved) {
          context.showSnack('Your booking has been extended.');
          Navigator.pop(context, true);
        } else if (state.status != ExtendStatus.failure &&
            state.errorMessage != null) {
          context.showSnack(state.errorMessage!, isError: true);
        }
      },
      builder: (context, state) => switch (state.status) {
        ExtendStatus.loading => const Center(
          child: CircularProgressIndicator(),
        ),
        ExtendStatus.failure => AppErrorView(
          message: state.errorMessage ?? "Couldn't load your wallet.",
          onRetry: context.read<ExtendBookingCubit>().load,
        ),
        _ => _ExtendForm(state: state),
      },
    );
  }
}

class _ExtendForm extends StatelessWidget {
  const _ExtendForm({required this.state});

  final ExtendBookingState state;

  /// The extra time the API allows: whole hours.
  static const List<int> _options = [1, 2, 3, 4];

  void _confirm(BuildContext context) {
    if (!state.canAfford) {
      context.showSnack(
        'Not enough balance. Top up your wallet first.',
        isError: true,
      );
      return;
    }
    context.read<ExtendBookingCubit>().extend();
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final cubit = context.read<ExtendBookingCubit>();
    final charge = Formatters.money(state.extraCost);

    return ListView(
      padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
      children: [
        _CurrentBookingCard(booking: state.booking),
        const SizedBox(height: 16),
        Text(
          'ADD EXTRA TIME',
          style: TextStyle(
            fontSize: 9,
            fontWeight: FontWeight.w500,
            color: palette.textHint,
          ),
        ),
        const SizedBox(height: 5),
        Row(
          children: [
            for (final (index, hours) in _options.indexed) ...[
              if (index > 0) const SizedBox(width: 8),
              Expanded(
                child: _HoursChip(
                  hours: hours,
                  isSelected: hours == state.extraHours,
                  onTap: state.allows(hours)
                      ? () => cubit.selectHours(hours)
                      : null,
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 18),
        _NewEndCard(
          newEnd: Formatters.time(state.newEndTime),
          charge: '+ $charge',
        ),
        const SizedBox(height: 8),
        PriceNote(
          capSaving: state.capSaving,
          specialPrices: state.specialPrices,
        ),
        const SizedBox(height: 8),
        _WalletCard(balance: state.balance, canAfford: state.canAfford),
        const SizedBox(height: 18),
        AppButton(
          label: 'Confirm extension · $charge',
          height: 48,
          isLoading: state.status == ExtendStatus.saving,
          onTap: () => _confirm(context),
        ),
        const SizedBox(height: 8),
        Center(
          child: TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(
              'Cancel',
              style: TextStyle(fontSize: 12, color: palette.textMuted),
            ),
          ),
        ),
      ],
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({this.height, required this.child, this.padding});

  final double? height;
  final Widget child;
  final EdgeInsets? padding;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: height,
      padding: padding ?? const EdgeInsets.symmetric(horizontal: 14),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: child,
    );
  }
}

/// "CURRENT BOOKING": lot and slot, then Started / Ends at / Elapsed.
class _CurrentBookingCard extends StatelessWidget {
  const _CurrentBookingCard({required this.booking});

  final Booking booking;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final elapsed = DateTime.now().difference(booking.startTime);

    Widget column(String label, String value, Color color) => Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: TextStyle(fontSize: 9, color: palette.textHint)),
          const SizedBox(height: 1),
          Text(
            value,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: color,
            ),
          ),
        ],
      ),
    );

    return _Card(
      padding: const EdgeInsets.fromLTRB(14, 10, 10, 9),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'CURRENT BOOKING',
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w500,
              color: palette.textHint,
            ),
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              Expanded(
                child: Text(
                  '${booking.lotName} · ${booking.slotNumber}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: palette.textPrimary,
                  ),
                ),
              ),
              Container(
                width: 10,
                height: 10,
                decoration: const BoxDecoration(
                  color: AppColors.teal,
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ),
          const SizedBox(height: 13),
          Row(
            children: [
              column(
                'Started',
                Formatters.time(booking.startTime),
                palette.textPrimary,
              ),
              column(
                'Ends at',
                Formatters.time(booking.endTime),
                AppColors.amber,
              ),
              column(
                'Elapsed',
                Formatters.duration(
                  elapsed.isNegative ? Duration.zero : elapsed,
                ),
                palette.textPrimary,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HoursChip extends StatelessWidget {
  const _HoursChip({
    required this.hours,
    required this.isSelected,
    required this.onTap,
  });

  final int hours;
  final bool isSelected;

  /// Null when it would make the booking longer than allowed.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      selected: isSelected,
      enabled: onTap != null,
      child: GestureDetector(
        onTap: onTap,
        child: Opacity(
          opacity: onTap == null ? 0.35 : 1,
          child: Container(
            height: 36,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: isSelected ? AppColors.tealBg : palette.surface2,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isSelected ? AppColors.teal : palette.border,
                width: isSelected ? 1 : 0.5,
              ),
            ),
            child: Text(
              '$hours hr',
              style: TextStyle(
                fontSize: 11,
                color: isSelected ? AppColors.tealLight : palette.textHint,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// "New end time" and "Extra charge".
class _NewEndCard extends StatelessWidget {
  const _NewEndCard({required this.newEnd, required this.charge});

  final String newEnd;
  final String charge;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    Widget column(String label, String value, Color color) => Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 10, color: palette.textHint)),
        const SizedBox(height: 6),
        Text(
          value,
          maxLines: 1,
          softWrap: false,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: color,
          ),
        ),
      ],
    );

    return _Card(
      // Content-sized, so long amounts and larger text sizes still fit.
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
      child: Row(
        children: [
          Expanded(child: column('New end time', newEnd, AppColors.tealLight)),
          const SizedBox(width: 12),
          column('Extra charge', charge, palette.textPrimary),
        ],
      ),
    );
  }
}

/// How the extension is paid: the wallet, the only method that charges.
class _WalletCard extends StatelessWidget {
  const _WalletCard({required this.balance, required this.canAfford});

  final int balance;
  final bool canAfford;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final amount = Formatters.money(balance);

    return _Card(
      height: 56,
      padding: const EdgeInsets.only(left: 11, right: 14),
      child: Row(
        children: [
          Icon(LucideIcons.wallet, size: 24, color: palette.textPrimary),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ParkEasy Wallet',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: palette.textPrimary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  canAfford
                      ? 'Balance: $amount'
                      : 'Balance: $amount · not enough',
                  style: TextStyle(
                    fontSize: 10,
                    color: canAfford ? palette.textHint : AppColors.red,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
