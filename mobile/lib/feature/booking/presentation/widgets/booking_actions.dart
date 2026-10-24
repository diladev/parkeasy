import 'dart:async';

import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';

/// "Gate QR code": where the code to open the gate goes.
class GateCodeTile extends StatelessWidget {
  const GateCodeTile({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        height: 64,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: palette.border, width: 0.5),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: palette.surface2,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(LucideIcons.qrCode, size: 24, color: palette.textHint),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Gate QR code',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: palette.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    'Scan to enter or exit the lot',
                    style: TextStyle(fontSize: 10, color: palette.textHint),
                  ),
                ],
              ),
            ),
            Text('›', style: TextStyle(fontSize: 18, color: palette.textHint)),
            const SizedBox(width: 1),
          ],
        ),
      ),
    );
  }
}

/// Extend (teal) and Directions (outlined), side by side.
class BookingActionButtons extends StatelessWidget {
  const BookingActionButtons({
    super.key,
    required this.onExtend,
    required this.onDirections,
  });

  final VoidCallback onExtend;
  final VoidCallback onDirections;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Row(
      children: [
        Expanded(
          child: BookingActionButton(
            icon: LucideIcons.clock9,
            label: 'Extend',
            background: AppColors.teal,
            // Light on teal in both themes.
            foreground: AppColors.textPrimary,
            isBold: true,
            onTap: onExtend,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: BookingActionButton(
            icon: LucideIcons.navigation,
            label: 'Directions',
            background: palette.surface,
            foreground: palette.textMuted,
            border: palette.border,
            onTap: onDirections,
          ),
        ),
      ],
    );
  }
}

/// A half-width button with a small icon: teal, or outlined with [border].
class BookingActionButton extends StatelessWidget {
  const BookingActionButton({
    super.key,
    required this.icon,
    required this.label,
    required this.background,
    required this.foreground,
    required this.onTap,
    this.border,
    this.isBold = false,
  });

  final IconData icon;
  final String label;
  final Color background;
  final Color foreground;
  final Color? border;
  final bool isBold;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final edge = border;

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
          height: 46,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 12, color: foreground),
              const SizedBox(width: 5),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isBold ? FontWeight.w500 : FontWeight.w400,
                  color: foreground,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The last action on an active booking. During the free cancellation window:
/// Cancel booking, with how long is left. After it: End parking, with when
/// free cancellation ended. It switches by itself when the window closes.
class CancelOrEndParking extends StatefulWidget {
  const CancelOrEndParking({
    super.key,
    required this.booking,
    required this.onCancel,
    required this.onEnd,
  });

  final Booking booking;
  final VoidCallback onCancel;
  final VoidCallback onEnd;

  @override
  State<CancelOrEndParking> createState() => _CancelOrEndParkingState();
}

class _CancelOrEndParkingState extends State<CancelOrEndParking> {
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _startTicking();
  }

  @override
  void didUpdateWidget(CancelOrEndParking oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.booking != widget.booking) _startTicking();
  }

  /// Ticks only while the window is open: the minutes left count down, and
  /// the last tick swaps Cancel for End parking.
  void _startTicking() {
    _ticker?.cancel();
    _ticker = null;
    if (!widget.booking.canCancelAt(DateTime.now())) return;
    _ticker = Timer.periodic(const Duration(seconds: 15), (_) {
      if (!widget.booking.canCancelAt(DateTime.now())) _ticker?.cancel();
      setState(() {});
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final booking = widget.booking;
    final now = DateTime.now();

    if (booking.canCancelAt(now)) {
      final minutes = booking.freeCancellationMinutesLeft(now);
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _RedButton(
            label: '✕  Cancel booking',
            onTap: widget.onCancel,
          ),
          const SizedBox(height: 10),
          _Note(
            icon: LucideIcons.timer,
            iconColor: AppColors.tealLight,
            text: booking.isPaidFromWallet
                ? 'Free cancellation for $minutes more min · full refund'
                : 'Free cancellation for $minutes more min',
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _RedButton(
          label: 'End parking',
          icon: LucideIcons.circleStop,
          onTap: widget.onEnd,
        ),
        const SizedBox(height: 10),
        _Note(
          icon: LucideIcons.clock,
          iconColor: context.palette.textHint,
          text:
              'Free cancellation ended at '
              '${Formatters.time(booking.cancellableUntil)}',
        ),
      ],
    );
  }
}

/// A full-width red-tinted button: "✕  Cancel booking", "End parking".
class _RedButton extends StatelessWidget {
  const _RedButton({required this.label, required this.onTap, this.icon});

  final String label;
  final IconData? icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final leading = icon;

    return Material(
      color: AppColors.red12,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: AppColors.red.withValues(alpha: 0.2),
          width: 0.5,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(
          height: 44,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (leading != null) ...[
                Icon(leading, size: 12, color: AppColors.red),
                const SizedBox(width: 6),
              ],
              Text(
                label,
                style: const TextStyle(fontSize: 12, color: AppColors.red),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A small centred line under the button.
class _Note extends StatelessWidget {
  const _Note({required this.icon, required this.iconColor, required this.text});

  final IconData icon;
  final Color iconColor;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 12, color: iconColor),
        const SizedBox(width: 6),
        Flexible(
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 10, color: context.palette.textHint),
          ),
        ),
      ],
    );
  }
}
