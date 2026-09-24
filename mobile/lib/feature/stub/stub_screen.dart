import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

class StubScreen extends StatelessWidget {
  final String routeName;

  const StubScreen({super.key, required this.routeName});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        backgroundColor: AppColors.bg,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: AppColors.textMuted,
            size: 18,
          ),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          routeName,
          style: const TextStyle(fontSize: 13, color: AppColors.textHint),
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
                Icons.build_rounded,
                size: 34,
                color: AppColors.tealLight,
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'Coming soon',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              routeName,
              style: const TextStyle(fontSize: 12, color: AppColors.textHint),
            ),
          ],
        ),
      ),
    );
  }
}
