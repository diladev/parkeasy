import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/domain/entities/user_entity.dart';

/// The card at the top of the profile: initials, name, email and phone.
class ProfileHeader extends StatelessWidget {
  const ProfileHeader({super.key, required this.user, required this.onEdit});

  final User user;
  final VoidCallback onEdit;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final textTheme = Theme.of(context).textTheme;

    return AppCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 58,
            height: 58,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.tealBg,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.teal, width: 1.5),
            ),
            child: Text(
              Formatters.initials(user.name),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppColors.tealLight,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name,
                  style: textTheme.titleLarge,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                _InfoLine(icon: Icons.mail_outline_rounded, text: user.email),
                if (user.phone.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  _InfoLine(icon: Icons.phone_outlined, text: user.phone),
                ],
              ],
            ),
          ),
          IconButton(
            onPressed: onEdit,
            tooltip: 'Edit profile',
            icon: Icon(Icons.edit_outlined, size: 20, color: palette.textMuted),
          ),
        ],
      ),
    );
  }
}

class _InfoLine extends StatelessWidget {
  const _InfoLine({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Row(
      children: [
        Icon(icon, size: 14, color: palette.textHint),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 12, color: palette.textMuted),
          ),
        ),
      ],
    );
  }
}
