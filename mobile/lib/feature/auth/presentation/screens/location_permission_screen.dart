import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';
import 'package:mobile/feature/location/domain/repositories/location_repository.dart';

class LocationPermissionScreen extends StatelessWidget {
  const LocationPermissionScreen({super.key});

  /// Shows the system prompt, then goes on whatever the answer: the app
  /// works without location (the map then opens on central Sulaymaniyah).
  Future<void> _allow(BuildContext context) async {
    await sl<LocationRepository>().requestPermission();
    if (context.mounted) AppRouter.toHome(context);
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return BaseScreenWrapper(
      child: AppScreen(
        body: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            children: [
              const SizedBox(height: 60),
              // Icon
              Container(
                width: 88,
                height: 88,
                decoration: const BoxDecoration(
                  color: AppColors.tealBg,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  LucideIcons.mapPin200,
                  size: 44,
                  color: AppColors.tealLight,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                l10n.allowLocation,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w500,
                  color: palette.textPrimary,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                l10n.locationWhy,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: palette.textHint,
                  height: 1.6,
                ),
              ),
              const SizedBox(height: 36),

              // Reasons card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: palette.surface,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: palette.border, width: 0.5),
                ),
                child: Column(
                  children: [
                    _ReasonRow(
                      icon: LucideIcons.search,
                      title: l10n.locationFindTitle,
                      subtitle: l10n.locationFindSubtitle,
                    ),
                    const SizedBox(height: 16),
                    _ReasonRow(
                      icon: LucideIcons.compass,
                      title: l10n.locationNavigateTitle,
                      subtitle: l10n.locationNavigateSubtitle,
                    ),
                    const SizedBox(height: 16),
                    _ReasonRow(
                      icon: LucideIcons.shieldCheck,
                      title: l10n.locationPrivateTitle,
                      subtitle: l10n.locationPrivateSubtitle,
                    ),
                  ],
                ),
              ),

              const Spacer(),
              AppButton(
                label: l10n.allowLocation,
                onTap: () => _allow(context),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => AppRouter.toHome(context),
                child: Text(
                  l10n.notNow,
                  style: TextStyle(color: palette.textMuted),
                ),
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}

class _ReasonRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _ReasonRow({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.tealBg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 24, color: AppColors.teal),
        ),
        const SizedBox(width: 14),
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
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: TextStyle(fontSize: 11, color: palette.textHint),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
