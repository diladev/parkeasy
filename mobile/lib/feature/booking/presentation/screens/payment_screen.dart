import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/booking/presentation/cubit/payment_cubit.dart';
import 'package:mobile/feature/booking/presentation/cubit/payment_state.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_summary_card.dart';
import 'package:mobile/feature/booking/presentation/widgets/duration_stepper.dart';
import 'package:mobile/feature/booking/presentation/widgets/payment_method_tile.dart';
import 'package:mobile/feature/booking/presentation/widgets/vehicle_picker.dart';

/// Step 2 of booking: check the summary, choose the hours and pay.
class PaymentScreen extends StatelessWidget {
  const PaymentScreen({super.key, required this.draft});

  final BookingDraft draft;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<PaymentCubit>(param1: draft)..load(),
      child: SafeArea(child: const _PaymentView()),
    );
  }
}

class _PaymentView extends StatelessWidget {
  const _PaymentView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AppTopBar(title: 'Payment'),
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
            message: state.errorMessage ?? "Couldn't load your wallet.",
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

  void _pay(BuildContext context) {
    if (state.vehicle == null) {
      context.showSnack('Add a vehicle to book a slot.', isError: true);
      return;
    }
    if (!state.canAfford) {
      context.showSnack(
        'Not enough balance. Top up your wallet first.',
        isError: true,
      );
      return;
    }
    context.read<PaymentCubit>().pay();
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<PaymentCubit>();
    final total = Formatters.money(state.total);
    final isPaying = state.status == PaymentStatus.paying;

    return ListView(
      padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
      children: [
        const _SectionLabel('BOOKING SUMMARY'),
        const SizedBox(height: 7),
        BookingSummaryCard(
          valueColumn: 226,
          rowHeight: 24,
          lastRowHeight: 18,
          topPadding: 10,
          bottomPadding: 14,
          rows: [
            SummaryRow(
              'Location',
              SummaryRow.text(context, state.draft.lotName),
            ),
            SummaryRow('Slot', SummaryRow.text(context, state.draft.slotLabel)),
            SummaryRow(
              'Vehicle',
              VehiclePicker(
                vehicles: state.vehicles,
                vehicle: state.vehicle,
                onSelected: cubit.selectVehicle,
                onAdd: () => _addVehicle(context),
              ),
              isControl: true,
            ),
            SummaryRow(
              'Duration',
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
          totalLabel: 'Total',
          total: total,
        ),
        const SizedBox(height: 18),
        const _SectionLabel('PAYMENT METHOD'),
        const SizedBox(height: 7),
        PaymentMethodTile(
          icon: LucideIcons.wallet200,
          title: 'ParkEasy Wallet',
          subtitle: state.canAfford
              ? 'Balance: ${Formatters.money(state.balance)}'
              : 'Balance: ${Formatters.money(state.balance)} · not enough',
          subtitleColor: state.canAfford ? null : AppColors.red,
          isSelected: true,
          onTap: () {},
        ),
        const SizedBox(height: 8),
        PaymentMethodTile(
          icon: LucideIcons.plus,
          title: 'Add new card',
          isSelected: false,
          onTap: () => AppRouter.toPaymentMethods(context),
        ),
        const SizedBox(height: 18),
        AppButton(
          label: 'Confirm & pay $total',
          height: 48,
          isLoading: isPaying,
          onTap: () => _pay(context),
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
