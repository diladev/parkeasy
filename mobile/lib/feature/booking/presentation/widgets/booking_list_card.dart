import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

/// A booking in My bookings: lot, address, status, slot and price.
/// Bookings that ended are dimmed.
class BookingListCard extends StatelessWidget {
  const BookingListCard({super.key, required this.booking, required this.onTap});

  final Booking booking;
  final VoidCallback onTap;

  /// Active: "Slot A04 · Level B1"; ended: "Slot A04 · 12 Oct · 2h".
  String get _details => booking.isActive
      ? 'Slot ${booking.slotLabel}'
      : [
          'Slot ${booking.slotNumber}',
          Formatters.day(booking.startTime),
          Formatters.duration(Duration(hours: booking.durationHours)),
        ].join(' · ');

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Opacity(
      opacity: booking.isActive ? 1 : 0.6,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          height: 100,
          padding: const EdgeInsets.fromLTRB(12, 8, 10, 0),
          decoration: BoxDecoration(
            color: palette.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: palette.border, width: 0.5),
          ),
          child: Column(
            children: [
              SizedBox(
                height: 46,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
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
                          style: TextStyle(
                            fontSize: 20,
                            color: palette.textPrimary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
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
                            booking.lotAddress,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 10,
                              color: palette.textHint,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: BookingStatusBadge(status: booking.status),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(right: 2),
                child: Divider(height: 1, thickness: 1, color: palette.border),
              ),
              const SizedBox(height: 7),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      _details,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(fontSize: 10, color: palette.textHint),
                    ),
                  ),
                  const SizedBox(width: 8),
                  SizedBox(
                    width: 60,
                    child: Text(
                      booking.isActive
                          ? '${Formatters.money(booking.pricePerHour)}/hr'
                          : Formatters.money(booking.totalCost),
                      maxLines: 1,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: booking.isActive
                            ? AppColors.tealLight
                            : palette.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// "Active", "Done" or "Cancelled".
class BookingStatusBadge extends StatelessWidget {
  const BookingStatusBadge({super.key, required this.status});

  final BookingStatus status;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (label, background, foreground) = switch (status) {
      BookingStatus.active => ('Active', AppColors.tealBg, AppColors.tealLight),
      BookingStatus.completed => ('Done', palette.surface2, palette.textHint),
      BookingStatus.cancelled => ('Cancelled', AppColors.red12, AppColors.red),
    };

    return Container(
      width: 60,
      height: 22,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w500,
          color: foreground,
        ),
      ),
    );
  }
}
