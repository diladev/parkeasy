import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/wallet/presentation/cubit/payment_methods_cubit.dart';
import 'package:mobile/feature/wallet/presentation/widgets/top_up_method_card.dart';

/// How bookings are paid. The ParkEasy Wallet pays for everything, and is
/// topped up with FIB (First Iraqi Bank). Cards aren't supported yet, so
/// they're shown as coming soon instead of a form that can't work.
class PaymentMethodsScreen extends StatelessWidget {
  const PaymentMethodsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<PaymentMethodsCubit>()..load(),
      child: const _PaymentMethodsView(),
    );
  }
}

class _PaymentMethodsView extends StatelessWidget {
  const _PaymentMethodsView();

  /// Tops up on the wallet screen, then shows the new balance.
  Future<void> _openWallet(BuildContext context) async {
    final cubit = context.read<PaymentMethodsCubit>();
    await AppRouter.toWallet(context);
    await cubit.load();
  }

  @override
  Widget build(BuildContext context) {
    return AppScreen(
      topBar: const AppTopBar(title: 'Payment methods'),
      body: BlocBuilder<PaymentMethodsCubit, PaymentMethodsState>(
        builder: (context, state) => switch (state.status) {
          PaymentMethodsStatus.loading => const Center(
            child: CircularProgressIndicator(),
          ),
          PaymentMethodsStatus.failure => AppErrorView(
            message: state.errorMessage ?? "Couldn't load your wallet.",
            onRetry: context.read<PaymentMethodsCubit>().load,
          ),
          PaymentMethodsStatus.loaded => ListView(
            padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
            children: [
              const _SectionLabel('WALLET'),
              const SizedBox(height: 7),
              _WalletCard(
                balance: state.balance,
                onTopUp: () => _openWallet(context),
              ),
              const SizedBox(height: 16),
              const _SectionLabel('ADD MONEY WITH'),
              const SizedBox(height: 7),
              const TopUpMethodCard(),
              const SizedBox(height: 16),
              const _SectionLabel('CARDS'),
              const SizedBox(height: 7),
              _ComingSoonRow(
                label: 'Add a new card',
                onTap: () => context.showSnack(
                  "Paying by card isn't available yet. "
                  'Top up your wallet with FIB instead.',
                ),
              ),
            ],
          ),
        },
      ),
    );
  }
}

/// The green card: the wallet is the default way to pay.
class _WalletCard extends StatelessWidget {
  const _WalletCard({required this.balance, required this.onTopUp});

  final int balance;
  final VoidCallback onTopUp;

  @override
  Widget build(BuildContext context) {
    final faded = Colors.white.withValues(alpha: 0.65);

    return Container(
      clipBehavior: Clip.antiAlias,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: const LinearGradient(
          colors: [AppColors.tealDim, AppColors.teal],
        ),
      ),
      child: Stack(
        children: [
          // The faint circle in the bottom-right corner.
          Positioned(
            right: -60,
            bottom: -110,
            child: Container(
              width: 180,
              height: 180,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white.withValues(alpha: 0.04),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Default',
                            style: TextStyle(fontSize: 10, color: faded),
                          ),
                          const SizedBox(height: 2),
                          const Text(
                            'ParkEasy Wallet',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Icon(
                      LucideIcons.wallet,
                      size: 24,
                      color: Colors.white.withValues(alpha: 0.7),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                FittedBox(
                  fit: BoxFit.scaleDown,
                  alignment: Alignment.centerLeft,
                  child: Text(
                    Formatters.money(balance),
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w500,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        'Pays for bookings and extensions',
                        style: TextStyle(fontSize: 10, color: faded),
                      ),
                    ),
                    Material(
                      color: Colors.white.withValues(alpha: 0.18),
                      borderRadius: BorderRadius.circular(8),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: onTopUp,
                        child: const Padding(
                          padding: EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 5,
                          ),
                          child: Text(
                            'Top up',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w500,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// A way to pay that isn't available yet, with a "Coming soon" pill.
class _ComingSoonRow extends StatelessWidget {
  const _ComingSoonRow({required this.label, required this.onTap});

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Material(
      color: palette.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          height: 46,
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: palette.border, width: 0.5),
          ),
          child: Row(
            children: [
              Icon(LucideIcons.plus, size: 14, color: palette.textMuted),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(fontSize: 13, color: palette.textMuted),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: palette.surface2,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  'Coming soon',
                  style: TextStyle(fontSize: 9, color: palette.textHint),
                ),
              ),
            ],
          ),
        ),
      ),
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
