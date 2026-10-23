import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/notifications/presentation/widgets/setting_toggle.dart';

/// One switch in a settings card: icon, name, detail and the toggle. The
/// whole row is the tap target.
class SettingRow extends StatelessWidget {
  const SettingRow({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isOn,
    required this.onChanged,
  });

  final Widget icon;
  final String title;
  final String subtitle;
  final bool isOn;

  /// Null for a switch that does nothing yet: shown off and dimmed.
  final ValueChanged<bool>? onChanged;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final change = onChanged;
    final isEnabled = change != null;

    return Semantics(
      toggled: isOn,
      enabled: isEnabled,
      label: '$title, $subtitle',
      excludeSemantics: true,
      child: InkWell(
        onTap: isEnabled ? () => change(!isOn) : null,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 10, 16, 10),
          child: Row(
            children: [
              icon,
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 12,
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
              const SizedBox(width: 12),
              Opacity(
                opacity: isEnabled ? 1 : 0.5,
                child: SettingToggle(isOn: isOn),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
