import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/core/router/app_router.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/theme/theme_cubit.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_bloc.dart';
import 'package:mobile/feature/auth/presentation/bloc/auth_event.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_bloc.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_event.dart';
import 'package:mobile/feature/profile/presentation/bloc/profile_state.dart';
import 'package:mobile/feature/profile/presentation/widgets/profile_header.dart';

/// The Profile tab. Shows the signed-in user (from ProfileBloc) and links to
/// everything account-related.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _refresh(BuildContext context) async {
    final bloc = context.read<ProfileBloc>()..add(ProfileRequested());
    await bloc.stream.firstWhere((s) => s.status != ProfileStatus.loading);
  }

  Future<void> _signOut(BuildContext context) async {
    final confirmed = await showAppConfirmDialog(
      context,
      title: 'Sign out?',
      message: 'You can sign back in any time with your email and password.',
      confirmLabel: 'Sign out',
      isDestructive: true,
    );
    // main.dart takes the user back to the login screen when this finishes.
    if (confirmed && context.mounted) {
      context.read<AuthBloc>().add(LoggedOut());
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScreen(
      body: BlocBuilder<ProfileBloc, ProfileState>(
        builder: (context, state) {
          final user = state.user;

          if (user == null) {
            if (state.status == ProfileStatus.failure) {
              return AppErrorView(
                message: state.errorMessage ?? "Couldn't load your profile.",
                onRetry: () =>
                    context.read<ProfileBloc>().add(ProfileRequested()),
              );
            }
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            color: AppColors.teal,
            onRefresh: () => _refresh(context),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(22, 16, 22, 32),
              children: [
                Text(
                  'Profile',
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
                const SizedBox(height: 16),
                ProfileHeader(
                  user: user,
                  onEdit: () => AppRouter.toEditProfile(context),
                ),
                const SizedBox(height: 24),

                const AppSectionHeader(title: 'Account'),
                const SizedBox(height: 8),
                _MenuCard(
                  children: [
                    AppMenuRow(
                      title: 'Personal details',
                      subtitle: 'Name, email, phone and birthday',
                      icon: LucideIcons.userRound,
                      iconColor: AppColors.tealLight,
                      iconBg: AppColors.tealBg,
                      onTap: () => AppRouter.toEditProfile(context),
                    ),
                    AppMenuRow(
                      title: 'My vehicles',
                      subtitle: 'Add your cars and pick a default',
                      icon: LucideIcons.car,
                      onTap: () => AppRouter.toMyVehicles(context),
                    ),
                    AppMenuRow(
                      title: 'Change password',
                      icon: LucideIcons.keyRound,
                      iconColor: AppColors.amber,
                      showDivider: false,
                      onTap: () => AppRouter.toChangePassword(context),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                const AppSectionHeader(title: 'Preferences'),
                const SizedBox(height: 8),
                _MenuCard(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 6),
                      child: BlocBuilder<ThemeCubit, bool>(
                        builder: (context, isDarkMode) => AppToggleRow(
                          title: 'Dark mode',
                          leading: const AppIconBox(
                            icon: LucideIcons.moon,
                            color: AppColors.purple,
                            background: AppColors.purple15,
                          ),
                          value: isDarkMode,
                          onChanged: (_) =>
                              context.read<ThemeCubit>().toggleTheme(),
                        ),
                      ),
                    ),
                    Divider(color: context.palette.border),
                    AppMenuRow(
                      title: 'Notifications',
                      icon: LucideIcons.bell,
                      iconColor: AppColors.amber,
                      iconBg: AppColors.amber12,
                      showDivider: false,
                      onTap: () => AppRouter.toNotificationsInbox(context),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                const AppSectionHeader(title: 'More'),
                const SizedBox(height: 8),
                _MenuCard(
                  children: [
                    AppMenuRow(
                      title: 'Wallet',
                      icon: LucideIcons.wallet,
                      iconColor: AppColors.amber,
                      iconBg: AppColors.amber12,
                      onTap: () => AppRouter.toWallet(context),
                    ),
                    AppMenuRow(
                      title: 'Help & support',
                      glyph: '?',
                      iconColor: AppColors.red,
                      showDivider: false,
                      onTap: () => AppRouter.toHelpSupport(context),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                _MenuCard(
                  children: [
                    AppMenuRow(
                      title: 'Sign out',
                      icon: LucideIcons.squareArrowRightExit,
                      isDestructive: true,
                      onTap: () => _signOut(context),
                    ),
                    AppMenuRow(
                      title: 'Delete account',
                      icon: LucideIcons.trash2,
                      isDestructive: true,
                      showDivider: false,
                      onTap: () => AppRouter.toDeleteAccount(context),
                    ),
                  ],
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// A card holding a group of menu rows.
class _MenuCard extends StatelessWidget {
  const _MenuCard({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
      child: Column(children: children),
    );
  }
}
