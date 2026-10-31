import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/l10n/language_cubit.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';

/// Profile > App language: English or Kurdish (Sorani). The choice applies
/// at once, to every screen and to the API's messages, and stays on this
/// phone. Kurdish turns the screens right to left; the bottom tabs keep
/// their order.
class AppLanguageScreen extends StatelessWidget {
  const AppLanguageScreen({super.key});

  /// Each language is named in its own script, so it can be found from
  /// either one.
  static const List<({String code, String name})> languages = [
    (code: 'en', name: 'English'),
    (code: 'ckb', name: 'کوردی'),
  ];

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return AppScreen(
      topBar: AppTopBar(title: l10n.appLanguage),
      body: BlocBuilder<LanguageCubit, String>(
        builder: (context, current) => ListView(
          padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
          children: [
            Text(
              l10n.appLanguageNote,
              style: TextStyle(
                fontSize: 13,
                height: 1.5,
                color: palette.textMuted,
              ),
            ),
            const SizedBox(height: 16),
            AppCard(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
              child: Column(
                children: [
                  for (final (index, language) in languages.indexed)
                    _LanguageRow(
                      name: language.name,
                      hint: l10n.languageHint(language.code),
                      isSelected: language.code == current,
                      showDivider: index < languages.length - 1,
                      onTap: () =>
                          context.read<LanguageCubit>().choose(language.code),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LanguageRow extends StatelessWidget {
  const _LanguageRow({
    required this.name,
    required this.hint,
    required this.isSelected,
    required this.showDivider,
    required this.onTap,
  });

  final String name;

  /// The language's name in the app's current language.
  final String hint;
  final bool isSelected;
  final bool showDivider;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      selected: isSelected,
      button: true,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            border: showDivider
                ? Border(bottom: BorderSide(color: palette.border, width: 0.5))
                : null,
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: palette.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(hint, style: Theme.of(context).textTheme.bodySmall),
                  ],
                ),
              ),
              Icon(
                isSelected ? LucideIcons.circleCheck : LucideIcons.circle,
                size: 22,
                color: isSelected ? AppColors.teal : palette.textHint,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
