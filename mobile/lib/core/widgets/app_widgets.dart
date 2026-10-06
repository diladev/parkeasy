import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

// Every neutral color (backgrounds, text, borders) comes from context.palette,
// so these widgets work in both dark and light mode. Brand and status colors
// (teal, red, amber...) come from AppColors.

// ─── Primary Button ───────────────────────────────────────────────────────────
class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool isLoading;
  final Color? backgroundColor;
  final Color? textColor;
  final double height;
  final IconData? icon;

  const AppButton({
    super.key,
    required this.label,
    this.onTap,
    this.isLoading = false,
    this.backgroundColor,
    this.textColor,
    this.height = 52,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: height,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor ?? AppColors.teal,
          foregroundColor: textColor ?? Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          elevation: 0,
        ),
        onPressed: isLoading ? null : onTap,
        child: isLoading
            ? const SizedBox(
                width: 22,
                height: 22,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: textColor ?? Colors.white,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

// ─── Outlined / Secondary Button ─────────────────────────────────────────────
class AppOutlinedButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final IconData? icon;
  final double height;

  const AppOutlinedButton({
    super.key,
    required this.label,
    this.onTap,
    this.icon,
    this.height = 50,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: height,
      child: OutlinedButton(
        onPressed: onTap,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 18, color: context.palette.textMuted),
              const SizedBox(width: 8),
            ],
            Text(label),
          ],
        ),
      ),
    );
  }
}

// ─── Destructive Button ───────────────────────────────────────────────────────
class AppDestructiveButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final bool isLoading;
  final IconData? icon;

  const AppDestructiveButton({
    super.key,
    required this.label,
    this.onTap,
    this.isLoading = false,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return AppButton(
      label: label,
      onTap: onTap,
      isLoading: isLoading,
      backgroundColor: AppColors.red,
      icon: icon,
    );
  }
}

// ─── App Input Field ──────────────────────────────────────────────────────────
class AppInputField extends StatelessWidget {
  final String label;
  final String? hint;
  final TextEditingController controller;
  final bool obscureText;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final Widget? suffixIcon;
  final Widget? prefixIcon;
  final bool readOnly;
  final VoidCallback? onTap;
  final int maxLines;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final Iterable<String>? autofillHints;
  final bool enabled;

  const AppInputField({
    super.key,
    required this.label,
    required this.controller,
    this.hint,
    this.obscureText = false,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.suffixIcon,
    this.prefixIcon,
    this.readOnly = false,
    this.onTap,
    this.maxLines = 1,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.autofillHints,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: palette.textMuted,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          obscureText: obscureText,
          keyboardType: keyboardType,
          validator: validator,
          readOnly: readOnly,
          onTap: onTap,
          maxLines: maxLines,
          enabled: enabled,
          textInputAction: textInputAction,
          textCapitalization: textCapitalization,
          autofillHints: autofillHints,
          style: TextStyle(fontSize: 13, color: palette.textPrimary),
          decoration: InputDecoration(
            hintText: hint,
            suffixIcon: suffixIcon,
            prefixIcon: prefixIcon,
          ),
        ),
      ],
    );
  }
}

// ─── Password Input Field (with show/hide) ───────────────────────────────────
class AppPasswordField extends StatefulWidget {
  final String label;
  final TextEditingController controller;
  final String? Function(String?)? validator;
  final TextInputAction? textInputAction;
  final Iterable<String>? autofillHints;

  const AppPasswordField({
    super.key,
    required this.label,
    required this.controller,
    this.validator,
    this.textInputAction,
    this.autofillHints,
  });

  @override
  State<AppPasswordField> createState() => _AppPasswordFieldState();
}

class _AppPasswordFieldState extends State<AppPasswordField> {
  bool _visible = false;

  @override
  Widget build(BuildContext context) {
    return AppInputField(
      label: widget.label,
      hint: '••••••••',
      controller: widget.controller,
      obscureText: !_visible,
      validator: widget.validator,
      textInputAction: widget.textInputAction,
      autofillHints: widget.autofillHints,
      suffixIcon: IconButton(
        icon: Icon(
          _visible ? Icons.visibility_off_rounded : Icons.visibility_rounded,
          color: context.palette.textHint,
          size: 20,
        ),
        onPressed: () => setState(() => _visible = !_visible),
      ),
    );
  }
}

// ─── App Card ─────────────────────────────────────────────────────────────────
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets? padding;
  final VoidCallback? onTap;
  final Color? color;
  final Color? borderColor;
  final double? borderWidth;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.onTap,
    this.color,
    this.borderColor,
    this.borderWidth,
  });

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: padding ?? const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: color ?? palette.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: borderColor ?? palette.border,
            width: borderWidth ?? 0.5,
          ),
        ),
        child: child,
      ),
    );
  }
}

// ─── Section Header ───────────────────────────────────────────────────────────
class AppSectionHeader extends StatelessWidget {
  final String title;
  final String? action;
  final VoidCallback? onAction;

  const AppSectionHeader({
    super.key,
    required this.title,
    this.action,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleMedium),
        if (action != null)
          GestureDetector(
            onTap: onAction,
            child: Text(
              action!,
              style: const TextStyle(fontSize: 12, color: AppColors.teal),
            ),
          ),
      ],
    );
  }
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
class AppBadge extends StatelessWidget {
  final String label;
  final AppBadgeStyle style;

  const AppBadge({
    super.key,
    required this.label,
    this.style = AppBadgeStyle.teal,
  });

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (bg, fg) = switch (style) {
      AppBadgeStyle.teal => (AppColors.tealBg, AppColors.tealLight),
      AppBadgeStyle.amber => (AppColors.amber15, AppColors.amber),
      AppBadgeStyle.red => (AppColors.red15, AppColors.red),
      AppBadgeStyle.gray => (palette.surface2, palette.textMuted),
      AppBadgeStyle.purple => (AppColors.purple15, AppColors.purple),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w500, color: fg),
      ),
    );
  }
}

enum AppBadgeStyle { teal, amber, red, gray, purple }

// ─── Topbar ───────────────────────────────────────────────────────────────────
class AppTopBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final Widget? trailing;
  final bool showBack;
  final VoidCallback? onBack;

  const AppTopBar({
    super.key,
    required this.title,
    this.trailing,
    this.showBack = true,
    this.onBack,
  });

  @override
  Size get preferredSize => const Size.fromHeight(52);

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      height: 52,
      decoration: BoxDecoration(
        color: palette.bg,
        border: Border(bottom: BorderSide(color: palette.border, width: 0.5)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: [
          if (showBack)
            GestureDetector(
              onTap: onBack ?? () => Navigator.maybePop(context),
              child: Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 18,
                color: palette.textMuted,
              ),
            ),
          if (showBack) const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
                color: palette.textPrimary,
              ),
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

// ─── Bottom Navigation Bar ────────────────────────────────────────────────────
class AppBottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;

  const AppBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      decoration: BoxDecoration(
        color: palette.surface,
        border: Border(top: BorderSide(color: palette.border, width: 0.5)),
      ),
      child: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: onTap,
        backgroundColor: Colors.transparent,
        elevation: 0,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.map_rounded), label: 'Map'),
          BottomNavigationBarItem(
            icon: Icon(Icons.bookmark_rounded),
            label: 'Bookings',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

// ─── Divider with label ───────────────────────────────────────────────────────
class AppDividerWithLabel extends StatelessWidget {
  final String label;

  const AppDividerWithLabel({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(child: Divider()),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            label,
            style: TextStyle(fontSize: 12, color: context.palette.textHint),
          ),
        ),
        const Expanded(child: Divider()),
      ],
    );
  }
}

// ─── Password Strength Indicator ─────────────────────────────────────────────
class PasswordStrengthBar extends StatelessWidget {
  final String password;

  const PasswordStrengthBar({super.key, required this.password});

  // Same rules as the API: length, upper + lower case, number, any symbol.
  int get _strength {
    if (password.isEmpty) return 0;
    int score = 0;
    if (password.length >= 8) score++;
    if (password.contains(RegExp(r'[A-Z]')) &&
        password.contains(RegExp(r'[a-z]'))) {
      score++;
    }
    if (password.contains(RegExp(r'[0-9]'))) score++;
    if (password.contains(RegExp(r'[^A-Za-z0-9\s]'))) score++;
    return score;
  }

  Color _barColor(int index, Color empty) {
    if (_strength == 0) return empty;
    if (_strength == 1) return index < 1 ? AppColors.red : empty;
    if (_strength == 2) return index < 2 ? AppColors.amber : empty;
    if (_strength == 3) return index < 3 ? AppColors.amber : empty;
    return AppColors.teal;
  }

  String get _label {
    return switch (_strength) {
      0 => '',
      1 => 'Weak',
      2 => 'Fair',
      3 => 'Good',
      _ => 'Strong',
    };
  }

  Color get _labelColor {
    return switch (_strength) {
      1 => AppColors.red,
      2 => AppColors.amber,
      3 => AppColors.amber,
      _ => AppColors.teal,
    };
  }

  @override
  Widget build(BuildContext context) {
    if (password.isEmpty) return const SizedBox.shrink();
    final empty = context.palette.surface2;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 8),
        Row(
          children: List.generate(
            4,
            (i) => Expanded(
              child: Container(
                margin: EdgeInsets.only(right: i < 3 ? 4 : 0),
                height: 4,
                decoration: BoxDecoration(
                  color: _barColor(i, empty),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
          ),
        ),
        if (_label.isNotEmpty) ...[
          const SizedBox(height: 6),
          Text(
            '$_label password',
            style: TextStyle(fontSize: 11, color: _labelColor),
          ),
        ],
      ],
    );
  }
}

// ─── Icon in a rounded square (menu and toggle rows) ─────────────────────────
class AppIconBox extends StatelessWidget {
  final IconData icon;
  final Color? color;
  final Color? background;

  const AppIconBox({
    super.key,
    required this.icon,
    this.color,
    this.background,
  });

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        color: background ?? palette.surface2,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Icon(icon, size: 18, color: color ?? palette.textMuted),
    );
  }
}

// ─── Toggle Row (for settings) ────────────────────────────────────────────────
class AppToggleRow extends StatelessWidget {
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final Widget? leading;

  const AppToggleRow({
    super.key,
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
    this.leading,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (leading != null) ...[leading!, const SizedBox(width: 14)],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(subtitle!, style: Theme.of(context).textTheme.bodySmall),
              ],
            ],
          ),
        ),
        Switch(value: value, onChanged: onChanged),
      ],
    );
  }
}

// ─── Menu Row (for the profile screen) ───────────────────────────────────────
class AppMenuRow extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData icon;
  final Color? iconColor;
  final Color? iconBg;
  final VoidCallback? onTap;
  final bool isDestructive;

  /// The line under the row. Turn it off for the last row of a card.
  final bool showDivider;

  const AppMenuRow({
    super.key,
    required this.title,
    required this.icon,
    this.subtitle,
    this.iconColor,
    this.iconBg,
    this.onTap,
    this.isDestructive = false,
    this.showDivider = true,
  });

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final color = isDestructive
        ? AppColors.red
        : (iconColor ?? palette.textMuted);
    final bg = isDestructive ? AppColors.red15 : (iconBg ?? palette.surface2);

    return GestureDetector(
      onTap: onTap,
      // Opaque, so a tap anywhere on the row counts (not only on the text).
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
            AppIconBox(icon: icon, color: color, background: bg),
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
                      color: isDestructive
                          ? AppColors.red
                          : palette.textPrimary,
                    ),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      subtitle!,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ],
              ),
            ),
            Icon(
              Icons.chevron_right_rounded,
              size: 18,
              color: palette.textHint,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Error state with a retry button ─────────────────────────────────────────
class AppErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;

  const AppErrorView({super.key, required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off_rounded, size: 40, color: palette.textHint),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: palette.textMuted),
            ),
            const SizedBox(height: 16),
            TextButton(onPressed: onRetry, child: const Text('Try again')),
          ],
        ),
      ),
    );
  }
}

// ─── Confirmation dialog ──────────────────────────────────────────────────────
/// Returns true when the user confirms.
Future<bool> showAppConfirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  bool isDestructive = false,
}) async {
  final palette = context.palette;
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (dialogContext) => AlertDialog(
      backgroundColor: palette.surface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: palette.textPrimary,
        ),
      ),
      content: Text(
        message,
        style: TextStyle(fontSize: 13, color: palette.textMuted, height: 1.5),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(dialogContext, false),
          child: Text('Cancel', style: TextStyle(color: palette.textMuted)),
        ),
        TextButton(
          onPressed: () => Navigator.pop(dialogContext, true),
          child: Text(
            confirmLabel,
            style: TextStyle(
              color: isDestructive ? AppColors.red : AppColors.teal,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ],
    ),
  );
  return confirmed ?? false;
}

// ─── Snackbars ────────────────────────────────────────────────────────────────
extension AppSnackBar on BuildContext {
  /// Shows [message] at the bottom. Errors are red.
  void showSnack(String message, {bool isError = false}) {
    ScaffoldMessenger.of(this)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: isError ? const TextStyle(color: Colors.white) : null,
          ),
          backgroundColor: isError ? AppColors.red : null,
        ),
      );
  }
}

// ─── Route helper ─────────────────────────────────────────────────────────────
extension RouteVisibility on BuildContext {
  /// False while another screen is pushed on top of this one.
  ///
  /// The auth screens share one AuthBloc and stay mounted under each other.
  /// Without this check, the login screen under the register screen also
  /// reacted to "signed in" and both navigated at once.
  bool get isCurrentRoute => ModalRoute.of(this)?.isCurrent ?? true;
}
