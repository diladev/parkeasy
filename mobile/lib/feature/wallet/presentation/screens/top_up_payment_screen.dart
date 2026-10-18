import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/presentation/cubit/top_up_cubit.dart';
import 'package:mobile/feature/wallet/presentation/cubit/top_up_state.dart';

/// Paying a top-up: the code to approve it with, then the result.
///
/// Going back leaves the payment open until it expires; the wallet only
/// changes if it's paid.
class TopUpPaymentScreen extends StatelessWidget {
  const TopUpPaymentScreen({super.key, required this.topUp});

  final TopUp topUp;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<TopUpCubit>(param1: topUp),
      child: AppScreen(
        topBar: const AppTopBar(title: 'Pay with FIB'),
        body: BlocConsumer<TopUpCubit, TopUpState>(
          listenWhen: (previous, current) =>
              current.errorSerial != previous.errorSerial,
          listener: (context, state) =>
              context.showSnack(state.errorMessage!, isError: true),
          builder: (context, state) => ListView(
            padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
            children: [
              _AmountCard(topUp: state.topUp),
              const SizedBox(height: 18),
              if (state.topUp.isPending)
                ..._pendingSection(context, state)
              else
                _ResultCard(topUp: state.topUp),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _pendingSection(BuildContext context, TopUpState state) {
    final cubit = context.read<TopUpCubit>();
    final topUp = state.topUp;

    return [
      const _SectionLabel('PAYMENT CODE'),
      const SizedBox(height: 7),
      _CodeCard(code: topUp.readableCode),
      const SizedBox(height: 8),
      _ExpiryNote(validUntil: topUp.validUntil, onExpired: cubit.refresh),
      const SizedBox(height: 18),
      if (topUp.isTestPayment) ...[
        const _SectionLabel('TEST BANK'),
        const SizedBox(height: 7),
        const _TestModeNote(),
        const SizedBox(height: 10),
        AppButton(
          label: 'Approve payment',
          height: 48,
          isLoading: state.action == TopUpAction.approving,
          onTap: state.isBusy ? null : cubit.approve,
        ),
        const SizedBox(height: 8),
        AppOutlinedButton(
          label: state.action == TopUpAction.declining
              ? 'Declining…'
              : 'Decline',
          height: 48,
          onTap: state.isBusy ? null : cubit.decline,
        ),
      ] else
        const _WaitingNote(),
      const SizedBox(height: 8),
      Center(
        child: TextButton(
          onPressed: state.isBusy ? null : cubit.cancel,
          child: Text(
            state.action == TopUpAction.cancelling
                ? 'Cancelling…'
                : 'Cancel top-up',
            style: const TextStyle(fontSize: 12, color: AppColors.red),
          ),
        ),
      ),
    ];
  }
}

class _AmountCard extends StatelessWidget {
  const _AmountCard({required this.topUp});

  final TopUp topUp;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Wallet top-up',
                  style: TextStyle(fontSize: 10, color: palette.textHint),
                ),
                const SizedBox(height: 6),
                Text(
                  Formatters.money(topUp.amount),
                  style: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w500,
                    color: palette.textPrimary,
                  ),
                ),
              ],
            ),
          ),
          _StatusBadge(status: topUp.status),
        ],
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final TopUpStatus status;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (String label, Color background, Color color) = switch (status) {
      TopUpStatus.pending => ('Waiting', AppColors.amber12, AppColors.amber),
      TopUpStatus.paid => ('Paid', AppColors.tealBg, AppColors.tealLight),
      TopUpStatus.declined => ('Declined', AppColors.red12, AppColors.red),
      TopUpStatus.expired => ('Expired', palette.surface2, palette.textMuted),
      TopUpStatus.cancelled => (
        'Cancelled',
        palette.surface2,
        palette.textMuted,
      ),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}

/// The code the customer enters in the FIB app, with a copy button.
class _CodeCard extends StatelessWidget {
  const _CodeCard({required this.code});

  final String code;

  Future<void> _copy(BuildContext context) async {
    await Clipboard.setData(ClipboardData(text: code));
    if (context.mounted) context.showSnack('Payment code copied.');
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      constraints: const BoxConstraints(minHeight: 54),
      padding: const EdgeInsets.only(left: 14, right: 4),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.teal),
      ),
      child: Row(
        children: [
          Expanded(
            child: SelectableText(
              code,
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w500,
                letterSpacing: 1.5,
                color: palette.textPrimary,
              ),
            ),
          ),
          IconButton(
            tooltip: 'Copy code',
            onPressed: () => _copy(context),
            icon: const Icon(
              LucideIcons.copy,
              size: 20,
              color: AppColors.tealLight,
            ),
          ),
        ],
      ),
    );
  }
}

/// "Enter this code in the FIB app · expires in 14:32", ticking.
class _ExpiryNote extends StatefulWidget {
  const _ExpiryNote({required this.validUntil, required this.onExpired});

  final DateTime validUntil;

  /// Called once at the deadline, so the server can report it expired.
  final VoidCallback onExpired;

  @override
  State<_ExpiryNote> createState() => _ExpiryNoteState();
}

class _ExpiryNoteState extends State<_ExpiryNote> {
  late final Timer _timer;
  bool _reportedExpiry = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_left == Duration.zero && !_reportedExpiry) {
        _reportedExpiry = true;
        widget.onExpired();
      }
      setState(() {});
    });
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  Duration get _left {
    final left = widget.validUntil.difference(DateTime.now());
    return left.isNegative ? Duration.zero : left;
  }

  @override
  Widget build(BuildContext context) {
    final left = _left;
    final minutes = left.inMinutes;
    final seconds = (left.inSeconds % 60).toString().padLeft(2, '0');

    return Text(
      'Enter this code in the FIB app to pay. '
      'It expires in $minutes:$seconds.',
      style: TextStyle(fontSize: 10, color: context.palette.textHint),
    );
  }
}

class _TestModeNote extends StatelessWidget {
  const _TestModeNote();

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.amber12,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            LucideIcons.flaskConical,
            size: 18,
            color: AppColors.amber,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Test mode: no real money moves. This stands in for the FIB '
              'app, so approve or decline the payment here as the customer '
              'would.',
              style: TextStyle(
                fontSize: 11,
                height: 1.4,
                color: palette.textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _WaitingNote extends StatelessWidget {
  const _WaitingNote();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const SizedBox(
          width: 16,
          height: 16,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            'Waiting for you to approve the payment in the FIB app…',
            style: TextStyle(fontSize: 11, color: context.palette.textMuted),
          ),
        ),
      ],
    );
  }
}

/// How the top-up ended, and the way back to the wallet.
class _ResultCard extends StatelessWidget {
  const _ResultCard({required this.topUp});

  final TopUp topUp;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final amount = Formatters.money(topUp.amount);
    final (IconData icon, Color color, String title, String body) =
        switch (topUp.status) {
          TopUpStatus.paid => (
            LucideIcons.circleCheck,
            AppColors.teal,
            'Wallet topped up',
            '$amount was added to your wallet.',
          ),
          TopUpStatus.declined => (
            LucideIcons.circleX,
            AppColors.red,
            'Payment declined',
            'The bank refused the payment, so your wallet was not charged.',
          ),
          TopUpStatus.expired => (
            LucideIcons.clock,
            palette.textMuted,
            'Payment expired',
            'Nobody approved it in time. Start a new top-up to try again.',
          ),
          TopUpStatus.cancelled || TopUpStatus.pending => (
            LucideIcons.circleX,
            palette.textMuted,
            'Top-up cancelled',
            'Nothing was charged.',
          ),
        };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 12),
        Icon(icon, size: 48, color: color),
        const SizedBox(height: 12),
        Text(
          title,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w500,
            color: palette.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          body,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 12, height: 1.4, color: palette.textMuted),
        ),
        const SizedBox(height: 24),
        AppButton(
          label: 'Back to wallet',
          height: 48,
          onTap: () =>
              Navigator.pop(context, topUp.status == TopUpStatus.paid),
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
