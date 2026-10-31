import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/service/onboarding_store.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_widgets.dart';

/// The welcome screen, shown once on a new phone before signing in or up.
/// Full screen: the green hero runs under the status bar, so no AppScreen.
class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key, this.store});

  /// Tests pass their own; the app uses the registered one.
  final OnboardingStore? store;

  Future<void> _getStarted(BuildContext context) async {
    await (store ?? sl<OnboardingStore>()).markSeen();
    if (!context.mounted) return;
    // Sign-up opens over Sign in, so Back from it lands on Sign in.
    AppRouter.toLogin(context);
    AppRouter.toRegister(context);
  }

  Future<void> _signIn(BuildContext context) async {
    await (store ?? sl<OnboardingStore>()).markSeen();
    if (context.mounted) AppRouter.toLogin(context);
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final topInset = MediaQuery.paddingOf(context).top;

    // White status bar icons on the green hero, in light and dark mode.
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: palette.bg,
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _Hero(topInset: topInset),
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 20, 22, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _Feature(
                      icon: LucideIcons.search,
                      title: l10n.onboardingFindTitle,
                      subtitle: l10n.onboardingFindSubtitle,
                    ),
                    const SizedBox(height: 12),
                    _Feature(
                      icon: LucideIcons.calendar,
                      title: l10n.onboardingReserveTitle,
                      subtitle: l10n.onboardingReserveSubtitle,
                    ),
                    const SizedBox(height: 12),
                    _Feature(
                      icon: LucideIcons.wallet,
                      title: l10n.onboardingPayTitle,
                      subtitle: l10n.onboardingPaySubtitle,
                    ),
                    const SizedBox(height: 20),
                    AppButton(
                      label: l10n.getStarted,
                      height: 48,
                      onTap: () => _getStarted(context),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          l10n.alreadyHaveAccount,
                          style: TextStyle(
                            fontSize: 11,
                            color: palette.textHint,
                          ),
                        ),
                        TextButton(
                          onPressed: () => _signIn(context),
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            minimumSize: const Size(0, 36),
                          ),
                          child: Text(
                            l10n.signIn,
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: AppColors.tealLight,
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
        ),
      ),
    );
  }
}

/// The green top: logo, name and tagline.
class _Hero extends StatelessWidget {
  const _Hero({required this.topInset});

  final double topInset;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.tealDim,
      padding: EdgeInsets.fromLTRB(22, topInset + 10, 22, 34),
      child: Column(
        children: [
          Container(
            width: 76,
            height: 76,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.teal,
              borderRadius: BorderRadius.circular(22),
            ),
            child: const Text(
              'P',
              style: TextStyle(
                fontSize: 44,
                fontWeight: FontWeight.w700,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'ParkEasy',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            l10n.tagline,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 12, color: AppColors.tealLight),
          ),
        ],
      ),
    );
  }
}

/// One line of what the app does: an icon in a soft green box, a title and a hint.
class _Feature extends StatelessWidget {
  const _Feature({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: AppColors.teal.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 20, color: AppColors.tealLight),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: palette.textPrimary,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: TextStyle(fontSize: 10, color: palette.textHint),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
