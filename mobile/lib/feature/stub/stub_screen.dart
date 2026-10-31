import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';

class StubScreen extends StatelessWidget {
  final String routeName;

  /// False inside the bottom-navigation tabs, where there's nothing to go back to.
  final bool showBack;

  const StubScreen({super.key, required this.routeName, this.showBack = true});

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Scaffold(
      backgroundColor: palette.bg,
      appBar: AppBar(
        backgroundColor: palette.bg,
        automaticallyImplyLeading: false,
        leading: showBack
            ? IconButton(
                icon: Text(
                  l10n.backArrow,
                  textDirection: TextDirection.ltr,
                  style: TextStyle(fontSize: 18, color: palette.textMuted),
                ),
                onPressed: () => Navigator.maybePop(context),
              )
            : null,
        title: Text(
          routeName,
          style: TextStyle(fontSize: 13, color: palette.textHint),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.tealBg,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.teal, width: 0.5),
              ),
              child: const Icon(
                LucideIcons.wrench,
                size: 34,
                color: AppColors.tealLight,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              l10n.comingSoon,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: palette.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              routeName,
              style: TextStyle(fontSize: 12, color: palette.textHint),
            ),
          ],
        ),
      ),
    );
  }
}
