import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// A booking in "Recent bookings": lot, time, slot and status.
class RecentBookingCard extends StatelessWidget {
  const RecentBookingCard({
    super.key,
    required this.booking,
    required this.onTap,
  });

  final BookingSummary booking;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final details = [
      Formatters.bookingTime(booking.startTime, booking.endTime),
      if (booking.slotNumber.isNotEmpty) booking.slotNumber,
    ].join(' · ');

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 62,
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: palette.border, width: 0.5),
        ),
        child: Stack(
          children: [
            Positioned(
              left: 12,
              top: 13,
              child: Container(
                width: 36,
                height: 36,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppColors.blue35,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  'P',
                  style: TextStyle(fontSize: 20, color: palette.textPrimary),
                ),
              ),
            ),
            Positioned(
              left: 60,
              top: 10,
              right: 70,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    booking.lotName,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: palette.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    details,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 10, color: palette.textHint),
                  ),
                ],
              ),
            ),
            Positioned(
              right: 8,
              top: 18,
              child: _StatusBadge(status: booking.status),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});

  final BookingStatus status;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (background, foreground) = switch (status) {
      BookingStatus.active => (AppColors.tealBg, AppColors.tealLight),
      BookingStatus.completed => (palette.surface2, palette.textMuted),
      BookingStatus.cancelled => (AppColors.red12, AppColors.red),
    };

    return Container(
      width: 60,
      height: 30,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w500,
          color: foreground,
        ),
      ),
    );
  }
}
