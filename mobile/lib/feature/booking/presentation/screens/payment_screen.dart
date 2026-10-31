import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/booking/presentation/cubit/payment_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/payment_state.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_summary_card.dart';
import 'package:mobile/feature/booking/presentation/widgets/duration_stepper.dart';
import 'package:mobile/feature/booking/presentation/widgets/payment_method_tile.dart';
import 'package:mobile/feature/booking/presentation/widgets/price_note.dart';
import 'package:mobile/feature/booking/presentation/widgets/vehicle_picker.dart';

/// Step 2 of booking: check the summary, choose the hours and pay.
class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key, required this.draft});

  final BookingDraft draft;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<PaymentCubit>(param1: draft)..load(),
      child: const _PaymentView(),
    );
  }
}

class _PaymentView extends StatelessWidget {
  const _PaymentView();

  @override
  Widget build(BuildContext context) {
    return AppScreen(
      topBar: AppTopBar(title: l10n.payment),
      body: BlocConsumer<PaymentCubit, PaymentState>(
        listenWhen: (previous, current) =>
            current.status == PaymentStatus.paid ||
            current.errorSerial != previous.errorSerial,
        listener: (context, state) {
          final booking = state.booking;
          if (state.status == PaymentStatus.paid && booking != null) {
            AppRouter.toBookingConfirmation(context, booking);
          } else if (state.status != PaymentStatus.failure &&
              state.errorMessage != null) {
            context.showSnack(state.errorMessage!, isError: true);
          }
        },
        builder: (context, state) => switch (state.status) {
          PaymentStatus.loading => const Center(
            child: CircularProgressIndicator(),
          ),
          PaymentStatus.failure => AppErrorView(
            message: state.errorMessage ?? l10n.couldntLoadWallet,
            onRetry: context.read<PaymentCubit>().load,
          ),
          _ => _PaymentForm(state: state),
        },
      ),
    );
  }
}

class _PaymentForm extends StatelessWidget {
  const _PaymentForm({required this.state});

  final PaymentState state;

  Future<void> _addVehicle(BuildContext context) async {
    final cubit = context.read<PaymentCubit>();
    final vehicle = await AppRouter.toVehicleForm(context);
    if (vehicle == null) return;
    // Book for the vehicle just added; the reload keeps this choice.
    cubit.selectVehicle(vehicle);
    await cubit.load();
  }

  /// Tops up the wallet, then shows the new balance.
  Future<void> _openWallet(BuildContext context) async {
    final cubit = context.read<PaymentCubit>();
    await AppRouter.toWallet(context);
    await cubit.load();
  }

  void _pay(BuildContext context) {
    if (state.vehicle == null) {
      context.showSnack(l10n.addVehicleToBook, isError: true);
      return;
    }
    if (!state.canAfford) {
      context.showSnack(l10n.notEnoughBalanceTapWallet, isError: true);
      return;
    }
    context.read<PaymentCubit>().pay();
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<PaymentCubit>();
    final quote = state.quote;
    final total = Formatters.money(quote.amount);
    final isPaying = state.status == PaymentStatus.paying;

    return ListView(
      padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
      children: [
        _SectionLabel(l10n.bookingSummary),
        const SizedBox(height: 7),
        BookingSummaryCard(
          valueColumn: 226,
          rowHeight: 24,
          lastRowHeight: 18,
          topPadding: 10,
          bottomPadding: 14,
          rows: [
            SummaryRow(
              l10n.location,
              SummaryRow.text(context, state.draft.lotName),
            ),
            SummaryRow(
              l10n.slot,
              SummaryRow.text(context, state.draft.slotLabel),
            ),
            SummaryRow(
              l10n.vehicle,
              VehiclePicker(
                vehicles: state.vehicles,
                vehicle: state.vehicle,
                onSelected: cubit.selectVehicle,
                onAdd: () => _addVehicle(context),
              ),
              isControl: true,
            ),
            SummaryRow(
              l10n.duration,
              DurationStepper(
                hours: state.durationHours,
                onDecrease: state.durationHours > 1
                    ? () => cubit.changeDuration(-1)
                    : null,
                onIncrease: state.durationHours < PaymentCubit.maxHours
                    ? () => cubit.changeDuration(1)
                    : null,
              ),
              isControl: true,
            ),
          ],
          totalLabel: l10n.total,
          total: total,
        ),
        const SizedBox(height: 10),
        PriceNote(
          capSaving: quote.capSaving,
          specialPrices: quote.specialPrices,
        ),
        if (quote.isCapped || quote.specialPrices.isNotEmpty)
          const SizedBox(height: 4),
        _CancellationPolicy(minutes: state.draft.freeCancellationMinutes),
        const SizedBox(height: 20),
        _SectionLabel(l10n.paymentMethod),
        const SizedBox(height: 7),
        PaymentMethodTile(
          icon: LucideIcons.wallet200,
          title: l10n.parkEasyWallet,
          subtitle: state.canAfford
              ? l10n.balance(Formatters.money(state.balance))
              : l10n.balanceTapToTopUp(Formatters.money(state.balance)),
          subtitleColor: state.canAfford ? null : AppColors.red,
          isSelected: true,
          onTap: () => _openWallet(context),
        ),
        const SizedBox(height: 8),
        PaymentMethodTile(
          icon: LucideIcons.plus,
          title: l10n.addNewCard,
          isSelected: false,
          onTap: () => AppRouter.toPaymentMethods(context),
        ),
        const SizedBox(height: 18),
        AppButton(
          label: l10n.confirmAndPay(total),
          height: 48,
          isLoading: isPaying,
          onTap: () => _pay(context),
        ),
      ],
    );
  }
}

/// "Free cancellation within 10 min of the start", under the summary.
class _CancellationPolicy extends StatelessWidget {
  const _CancellationPolicy({required this.minutes});

  final int minutes;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Row(
      children: [
        Icon(
          LucideIcons.shieldCheck,
          size: 12,
          color: minutes > 0 ? AppColors.tealLight : palette.textHint,
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            minutes > 0
                ? l10n.freeCancellationWithin(minutes)
                : l10n.noFreeCancellation,
            style: TextStyle(fontSize: 10, color: palette.textHint),
          ),
        ),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w500,
        color: context.palette.textHint,
      ),
    );
  }
}
