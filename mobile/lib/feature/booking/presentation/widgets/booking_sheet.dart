import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// Opens a confirmation sheet (cancel, end parking) over the booking screen.
Future<void> showBookingSheet(BuildContext context, WidgetBuilder builder) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    backgroundColor: context.palette.surface,
    barrierColor: Colors.black.withValues(alpha: 0.6),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: builder,
  );
}

/// The layout both booking sheets share: a big red icon, the question, an
/// amber note about the money, a red confirm button and a way back.
class BookingSheet extends StatelessWidget {
  const BookingSheet({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    required this.note,
    required this.confirmLabel,
    required this.backLabel,
    required this.isBusy,
    required this.onConfirm,
    this.confirmIcon,
  });

  final IconData icon;
  final String title;
  final String message;
  final String note;
  final String confirmLabel;

  /// Shown before [confirmLabel], if set.
  final IconData? confirmIcon;
  final String backLabel;

  /// While the request runs: the confirm button spins, nothing is tappable.
  final bool isBusy;
  final VoidCallback onConfirm;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(22, 12, 22, 22),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Center(
              child: Container(
                width: 30,
                height: 4,
                decoration: BoxDecoration(
                  color: palette.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 18),
            Icon(icon, size: 64, color: AppColors.red),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w500,
                color: palette.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                height: 1.35,
                color: palette.textHint,
              ),
            ),
            const SizedBox(height: 18),
            _SheetNote(text: note),
            const SizedBox(height: 30),
            _SheetButton(
              label: confirmLabel,
              icon: confirmIcon,
              background: AppColors.red,
              foreground: Colors.white,
              isBold: true,
              height: 48,
              isLoading: isBusy,
              onTap: isBusy ? null : onConfirm,
            ),
            const SizedBox(height: 10),
            _SheetButton(
              label: backLabel,
              background: palette.surface,
              foreground: palette.textMuted,
              border: palette.border,
              height: 46,
              onTap: isBusy ? null : () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}

/// The amber box saying what happens to the money.
class _SheetNote extends StatelessWidget {
  const _SheetNote({required this.text});

  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 8, 14, 8),
      constraints: const BoxConstraints(minHeight: 52),
      decoration: BoxDecoration(
        color: AppColors.amber12,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: AppColors.amber.withValues(alpha: 0.25),
          width: 0.5,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Text(
              text,
              style: const TextStyle(
                fontSize: 10,
                height: 1.4,
                color: AppColors.amber,
              ),
            ),
          ),
          const SizedBox(width: 12),
          const Icon(LucideIcons.info, size: 24, color: AppColors.amber),
        ],
      ),
    );
  }
}

class _SheetButton extends StatelessWidget {
  const _SheetButton({
    required this.label,
    required this.background,
    required this.foreground,
    required this.height,
    required this.onTap,
    this.icon,
    this.border,
    this.isBold = false,
    this.isLoading = false,
  });

  final String label;
  final IconData? icon;
  final Color background;
  final Color foreground;
  final Color? border;
  final double height;
  final bool isBold;
  final bool isLoading;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final edge = border;
    final leading = icon;

    return Material(
      color: background,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: edge == null
            ? BorderSide.none
            : BorderSide(color: edge, width: 0.5),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: height,
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: foreground,
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (leading != null) ...[
                        Icon(leading, size: 13, color: foreground),
                        const SizedBox(width: 6),
                      ],
                      Text(
                        label,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: isBold
                              ? FontWeight.w500
                              : FontWeight.w400,
                          color: foreground,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
