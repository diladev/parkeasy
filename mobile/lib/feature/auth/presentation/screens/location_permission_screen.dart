import 'package:flutter/material.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/core/connection/connectivity_wrapper.dart';

class LocationPermissionScreen extends StatelessWidget {
  const LocationPermissionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BaseScreenWrapper(
      child: Scaffold(
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              children: [
                const SizedBox(height: 60),
                // Icon
                Container(
                  width: 90,
                  height: 90,
                  decoration: BoxDecoration(
                    color: AppColors.tealBg,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.teal, width: 1.5),
                  ),
                  child: const Icon(
                    Icons.location_on_rounded,
                    size: 44,
                    color: AppColors.tealLight,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Allow location access',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                const Text(
                  'ParkEasy needs your location to show nearby parking spots and guide you to your booked slot.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 13,
                    color: AppColors.textHint,
                    height: 1.6,
                  ),
                ),
                const SizedBox(height: 36),

                // Reasons card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.border, width: 0.5),
                  ),
                  child: Column(
                    children: const [
                      _ReasonRow(
                        icon: Icons.search_rounded,
                        title: 'Find nearby spots',
                        subtitle: 'See available parking around you',
                      ),
                      SizedBox(height: 16),
                      _ReasonRow(
                        icon: Icons.navigation_rounded,
                        title: 'Navigate to your spot',
                        subtitle: 'Turn-by-turn to the parking lot',
                      ),
                      SizedBox(height: 16),
                      _ReasonRow(
                        icon: Icons.shield_rounded,
                        title: 'Location is never sold',
                        subtitle: 'Used only while using the app',
                      ),
                    ],
                  ),
                ),

                const Spacer(),
                AppButton(
                  label: 'Allow location access',
                  onTap: () {
                    // TODO: Request actual location permission via permission_handler
                    AppRouter.toHome(context);
                  },
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => AppRouter.toHome(context),
                  child: const Text(
                    'Not now',
                    style: TextStyle(color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
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
    return Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: AppColors.tealBg,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, size: 20, color: AppColors.tealLight),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(fontSize: 11, color: AppColors.textHint),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
