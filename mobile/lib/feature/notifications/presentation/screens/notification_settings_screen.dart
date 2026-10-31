import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/notifications/domain/entities/notification_settings.dart';
import 'package:mobile/feature/notifications/presentation/cubit/notification_settings_cubit.dart';
import 'package:mobile/feature/notifications/presentation/widgets/setting_row.dart';

/// Which notifications and emails the user gets.
class NotificationSettingsScreen extends StatelessWidget {
  const NotificationSettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<NotificationSettingsCubit>()..load(),
      child: AppScreen(
        topBar: AppTopBar(title: l10n.notifications),
        body:
            BlocConsumer<NotificationSettingsCubit, NotificationSettingsState>(
              listenWhen: (previous, current) =>
                  current.errorSerial != previous.errorSerial,
              listener: (context, state) =>
                  context.showSnack(state.errorMessage!, isError: true),
              builder: (context, state) {
                final settings = state.settings;
                if (settings != null) return _Settings(settings: settings);
                if (state.status == NotificationSettingsStatus.failure) {
                  return AppErrorView(
                    message:
                        state.errorMessage ??
                        l10n.couldntLoadNotificationSettings,
                    onRetry: context.read<NotificationSettingsCubit>().load,
                  );
                }
                return const Center(child: CircularProgressIndicator());
              },
            ),
      ),
    );
  }
}

/// A switch on the screen: what it says and how its icon looks.
class _Item {
  const _Item(this.setting, this.title, this.subtitle, this.icon);

  final NotificationSetting setting;
  final String title;
  final String subtitle;
  final Widget icon;
}

class _Settings extends StatelessWidget {
  const _Settings({required this.settings});

  final NotificationSettings settings;

  // Colours from the design that aren't in the app palette.
  static const Color _sage = Color(0xFFB0BCA8);
  static const Color _olive = Color(0xFF9F9751);
  static const Color _mailBlue = Color(0xFF0064B0);

  /// In the app's inbox. There are no push notifications (that needs
  /// Firebase), so these show up under the bell on Home.
  static List<_Item> get _inApp => [
    _Item(
      NotificationSetting.bookingReminders,
      l10n.bookingReminders,
      l10n.bookingRemindersHint,
      const AppIconBox(
        glyph: 'P',
        color: AppColors.textPrimary,
        background: AppColors.blue35,
      ),
    ),
    _Item(
      NotificationSetting.expiryAlerts,
      l10n.expiryAlerts,
      l10n.expiryAlertsHint,
      const AppIconBox(
        icon: LucideIcons.clock10,
        color: _sage,
        background: Color(0x26B0BCA8),
      ),
    ),
    _Item(
      NotificationSetting.offers,
      l10n.offers,
      l10n.offersHint,
      const AppIconBox(
        icon: LucideIcons.tag,
        color: _olive,
        background: Color(0x269F9751),
      ),
    ),
    _Item(
      NotificationSetting.loyaltyRewards,
      l10n.loyaltyRewards,
      l10n.loyaltyRewardsHint,
      const AppIconBox(
        icon: LucideIcons.star,
        color: AppColors.amber,
        background: AppColors.amber12,
      ),
    ),
  ];

  static List<_Item> get _email => [
    _Item(
      NotificationSetting.bookingReceiptEmails,
      l10n.bookingReceipts,
      l10n.bookingReceiptsHint,
      const AppIconBox(
        icon: LucideIcons.receipt,
        color: AppColors.teal,
        background: AppColors.tealBg,
      ),
    ),
    _Item(
      NotificationSetting.newsletter,
      l10n.newsletter,
      l10n.newsletterHint,
      const AppIconBox(
        icon: LucideIcons.mail,
        color: _mailBlue,
        background: Color(0x260064B0),
      ),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(22, 14, 22, 24),
      children: [
        _SectionLabel(l10n.inAppNotifications),
        const SizedBox(height: 5),
        _SettingsCard(items: _inApp, settings: settings),
        const SizedBox(height: 16),
        _SectionLabel(l10n.emailNotifications),
        const SizedBox(height: 5),
        _SettingsCard(items: _email, settings: settings),
      ],
    );
  }
}

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({required this.items, required this.settings});

  final List<_Item> items;
  final NotificationSettings settings;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final cubit = context.read<NotificationSettingsCubit>();

    return Material(
      color: palette.surface,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: palette.border, width: 0.5),
      ),
      child: Column(
        children: [
          for (final (index, item) in items.indexed) ...[
            if (index > 0)
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: Divider(height: 1, thickness: 1, color: palette.border),
              ),
            SettingRow(
              icon: item.icon,
              title: item.title,
              subtitle: settings.isAvailable(item.setting)
                  ? item.subtitle
                  : l10n.withComingSoon(item.subtitle),
              isOn: settings.isOn(item.setting),
              onChanged: settings.isAvailable(item.setting)
                  ? (value) => cubit.toggle(item.setting, value)
                  : null,
            ),
          ],
        ],
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
