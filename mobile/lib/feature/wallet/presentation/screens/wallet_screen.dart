import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/presentation/cubit/wallet_cubit.dart';
import 'package:mobile/feature/wallet/presentation/cubit/wallet_state.dart';
import 'package:mobile/feature/wallet/presentation/widgets/balance_card.dart';
import 'package:mobile/feature/wallet/presentation/widgets/top_up_amount_field.dart';
import 'package:mobile/feature/wallet/presentation/widgets/top_up_method_card.dart';
import 'package:mobile/feature/wallet/presentation/widgets/wallet_transaction_row.dart';

/// The ParkEasy Wallet: the balance, topping it up and its history.
class WalletScreen extends StatelessWidget {
  const WalletScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<WalletCubit>()..load(),
      child: const AppScreen(
        topBar: AppTopBar(title: 'ParkEasy Wallet'),
        body: _WalletView(),
      ),
    );
  }
}

class _WalletView extends StatefulWidget {
  const _WalletView();

  @override
  State<_WalletView> createState() => _WalletViewState();
}

class _WalletViewState extends State<_WalletView> {
  final _amountController = TextEditingController(
    text: Formatters.dinars(WalletState.defaultAmount),
  );
  final _amountFocus = FocusNode();

  @override
  void dispose() {
    _amountController.dispose();
    _amountFocus.dispose();
    super.dispose();
  }

  void _pickAmount(int amount) {
    _amountController.text = Formatters.dinars(amount);
    context.read<WalletCubit>().changeAmount(amount);
  }

  /// Pays the top-up on its own screen, then shows the new balance.
  Future<void> _payTopUp(TopUp topUp) async {
    final cubit = context.read<WalletCubit>();
    _amountFocus.unfocus();
    await AppRouter.toTopUpPayment(context, topUp);
    if (!mounted) return;
    await cubit.load();
  }

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<WalletCubit>();

    return MultiBlocListener(
      listeners: [
        BlocListener<WalletCubit, WalletState>(
          listenWhen: (previous, current) =>
              current.topUpSerial != previous.topUpSerial,
          listener: (context, state) => _payTopUp(state.startedTopUp!),
        ),
        // Errors while the wallet is on screen (refresh, next page, top-up).
        BlocListener<WalletCubit, WalletState>(
          listenWhen: (previous, current) =>
              current.errorSerial != previous.errorSerial &&
              current.status == WalletStatus.loaded,
          listener: (context, state) =>
              context.showSnack(state.errorMessage!, isError: true),
        ),
      ],
      child: BlocBuilder<WalletCubit, WalletState>(
        builder: (context, state) => switch (state.status) {
          WalletStatus.loading => const Center(
            child: CircularProgressIndicator(),
          ),
          WalletStatus.failure => AppErrorView(
            message: state.errorMessage ?? "Couldn't load your wallet.",
            onRetry: cubit.load,
          ),
          WalletStatus.loaded => _WalletContent(
            state: state,
            amountController: _amountController,
            amountFocus: _amountFocus,
            onPickAmount: _pickAmount,
          ),
        },
      ),
    );
  }
}

class _WalletContent extends StatelessWidget {
  const _WalletContent({
    required this.state,
    required this.amountController,
    required this.amountFocus,
    required this.onPickAmount,
  });

  final WalletState state;
  final TextEditingController amountController;
  final FocusNode amountFocus;
  final ValueChanged<int> onPickAmount;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<WalletCubit>();
    final buttonLabel = state.isAmountValid
        ? 'Top up ${Formatters.money(state.amount)}'
        : 'Top up';

    return RefreshIndicator(
      color: AppColors.teal,
      onRefresh: cubit.load,
      child: NotificationListener<ScrollNotification>(
        // Load the next page of history a little before the end.
        onNotification: (notification) {
          if (notification.metrics.extentAfter < 200) cubit.loadMore();
          return false;
        },
        child: ListView(
          physics: const AlwaysScrollableScrollPhysics(),
          keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
          padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
          children: [
            BalanceCard(
              balance: state.balance,
              onTopUp: amountFocus.requestFocus,
              // Not offered yet: money only goes into the wallet for now.
              onWithdraw: () => context.showSnack(
                "Withdrawals aren't available yet.",
              ),
            ),
            const SizedBox(height: 18),
            const _SectionLabel('TOP UP AMOUNT'),
            const SizedBox(height: 7),
            TopUpAmountField(
              controller: amountController,
              focusNode: amountFocus,
              onChanged: cubit.changeAmount,
            ),
            const SizedBox(height: 10),
            AmountPresets(
              amounts: WalletState.presets,
              selected: state.amount,
              onSelected: onPickAmount,
            ),
            const SizedBox(height: 14),
            const TopUpMethodCard(),
            const SizedBox(height: 16),
            AppButton(
              label: buttonLabel,
              height: 48,
              isLoading: state.isStartingTopUp,
              onTap: cubit.startTopUp,
            ),
            const SizedBox(height: 18),
            const _SectionLabel('RECENT TRANSACTIONS'),
            const SizedBox(height: 7),
            ..._history(context),
          ],
        ),
      ),
    );
  }

  /// The rows, with a line between each.
  List<Widget> _history(BuildContext context) {
    final palette = context.palette;
    if (state.transactions.isEmpty) {
      return [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 24),
          child: Text(
            'Top-ups, payments and refunds show up here.',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 11, color: palette.textHint),
          ),
        ),
      ];
    }

    return [
      for (var i = 0; i < state.transactions.length; i++) ...[
        if (i > 0) ...[
          Container(height: 1, color: palette.border),
          const SizedBox(height: 1),
        ],
        WalletTransactionRow(transaction: state.transactions[i]),
      ],
      if (state.isLoadingMore)
        const Padding(
          padding: EdgeInsets.only(top: 12),
          child: Center(
            child: SizedBox(
              width: 22,
              height: 22,
              child: CircularProgressIndicator(strokeWidth: 2),
            ),
          ),
        ),
    ];
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
