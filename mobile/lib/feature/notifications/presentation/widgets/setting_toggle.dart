import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The small on/off switch from the design (34 x 20).
class SettingToggle extends StatelessWidget {
  const SettingToggle({super.key, required this.isOn});

  final bool isOn;

  static const Duration _slide = Duration(milliseconds: 150);

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return AnimatedContainer(
      duration: _slide,
      width: 34,
      height: 20,
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: isOn ? AppColors.teal : palette.surface2,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isOn ? AppColors.teal : palette.border,
          width: isOn ? 0 : 0.5,
        ),
      ),
      child: AnimatedAlign(
        duration: _slide,
        curve: Curves.easeOut,
        alignment: isOn
            ? AlignmentDirectional.centerEnd
            : AlignmentDirectional.centerStart,
        child: Container(
          width: 15,
          height: 15,
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }
}
