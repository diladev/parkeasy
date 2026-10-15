import 'dart:async';

import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// The banner at the top of the booking details: status, times and amount.
///
/// For an active booking the elapsed time ticks every 30 seconds.
class BookingStatusBanner extends StatefulWidget {
  const BookingStatusBanner({super.key, required this.booking});

  final Booking booking;

  @override
  State<BookingStatusBanner> createState() => _BookingStatusBannerState();
}

class _BookingStatusBannerState extends State<BookingStatusBanner> {
  Timer? _ticker;

  @override
  void initState() {
    super.initState();
    _startTicking();
  }

  @override
  void didUpdateWidget(BookingStatusBanner oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.booking.status != widget.booking.status) _startTicking();
  }

  void _startTicking() {
    _ticker?.cancel();
    _ticker = widget.booking.isActive
        ? Timer.periodic(const Duration(seconds: 30), (_) => setState(() {}))
        : null;
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  /// "Started 9:15 AM · 1h 22m elapsed", or once its time is up but the
  /// server hasn't closed it yet, "Ended 11:15 AM".
  String _activeSubtitle(Booking booking) {
    final now = DateTime.now();
    if (!now.isBefore(booking.endTime)) {
      return 'Ended ${Formatters.time(booking.endTime)}';
    }
    final elapsed = now.difference(booking.startTime);
    final shown = elapsed.isNegative ? Duration.zero : elapsed;
    return 'Started ${Formatters.time(booking.startTime)} · '
        '${Formatters.duration(shown)} elapsed';
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final booking = widget.booking;
    final hours = Formatters.duration(Duration(hours: booking.durationHours));

    final style = switch (booking.status) {
      BookingStatus.active => _BannerStyle(
        background: AppColors.tealBg,
        border: AppColors.teal,
        dot: AppColors.teal,
        title: 'Active booking',
        titleColor: AppColors.tealLight,
        subtitle: _activeSubtitle(booking),
        subtitleColor: AppColors.tealDim,
        amount: Formatters.money(booking.totalCost),
        amountColor: AppColors.tealLight,
      ),
      BookingStatus.completed => _BannerStyle(
        background: palette.surface,
        border: palette.border,
        dot: palette.textHint,
        title: 'Completed booking',
        titleColor: palette.textMuted,
        subtitle: 'Ended ${Formatters.time(booking.endTime)} · $hours',
        subtitleColor: palette.textHint,
        amount: Formatters.money(booking.totalCost),
        amountColor: palette.textPrimary,
      ),
      BookingStatus.cancelled => _BannerStyle(
        background: AppColors.red12,
        border: AppColors.red.withValues(alpha: 0.2),
        dot: AppColors.red,
        title: 'Cancelled booking',
        titleColor: AppColors.red,
        subtitle: 'Started ${Formatters.time(booking.startTime)} · $hours',
        subtitleColor: palette.textHint,
        // Cancelling can refund part or all of it, so no amount here.
        amount: null,
        amountColor: AppColors.red,
      ),
    };
    final amount = style.amount;

    return Container(
      height: 54,
      padding: const EdgeInsets.only(left: 16, right: 14),
      decoration: BoxDecoration(
        color: style.background,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: style.border, width: 0.5),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: style.dot, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  style.title,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: style.titleColor,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  style.subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: 10, color: style.subtitleColor),
                ),
              ],
            ),
          ),
          if (amount != null)
            Text(
              amount,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: style.amountColor,
              ),
            ),
        ],
      ),
    );
  }
}

class _BannerStyle {
  const _BannerStyle({
    required this.background,
    required this.border,
    required this.dot,
    required this.title,
    required this.titleColor,
    required this.subtitle,
    required this.subtitleColor,
    required this.amount,
    required this.amountColor,
  });

  final Color background;
  final Color border;
  final Color dot;
  final String title;
  final Color titleColor;
  final String subtitle;
  final Color subtitleColor;
  final String? amount;
  final Color amountColor;
}
