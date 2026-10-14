import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/parking/domain/entities/parking_slot.dart';

/// The price per hour, the picked slot and "Book now".
class BookingBar extends StatelessWidget {
  const BookingBar({
    super.key,
    required this.pricePerHour,
    required this.selectedSlot,
    required this.onBook,
  });

  final double pricePerHour;
  final ParkingSlot? selectedSlot;
  final VoidCallback onBook;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final slot = selectedSlot;

    return Padding(
      padding: const EdgeInsets.fromLTRB(22, 3, 22, 0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text.rich(
                  TextSpan(
                    children: [
                      TextSpan(
                        text: Formatters.money(pricePerHour),
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w500,
                          color: palette.textPrimary,
                        ),
                      ),
                      TextSpan(
                        text: '/hr',
                        style: TextStyle(fontSize: 10, color: palette.textHint),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  slot == null
                      ? 'Pick a free slot'
                      : 'Slot ${slot.slotNumber} · Level ${slot.level}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 10,
                    color: slot == null ? palette.textHint : AppColors.tealLight,
                  ),
                ),
              ],
            ),
          ),
          _BookButton(onTap: slot == null ? null : onBook),
        ],
      ),
    );
  }
}

class _BookButton extends StatelessWidget {
  const _BookButton({required this.onTap});

  /// Null until a slot is picked.
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: onTap == null ? 0.4 : 1,
      child: Material(
        color: AppColors.teal,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: const SizedBox(
            width: 118,
            height: 44,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  LucideIcons.calendarDays,
                  size: 12,
                  color: AppColors.textPrimary,
                ),
                SizedBox(width: 5),
                Text(
                  'Book now',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: Colors.white,
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
