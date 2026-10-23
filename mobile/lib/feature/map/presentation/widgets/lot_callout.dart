import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/parking/domain/entities/parking_lot_summary.dart';

/// The box above a selected pin: name, free slots and price. Tap to open
/// the lot.
class LotCallout extends StatelessWidget {
  const LotCallout({super.key, required this.lot, required this.onTap});

  final ParkingLotSummary lot;
  final VoidCallback onTap;

  /// Room the pin under it takes, so the box sits just above it.
  static const double pinGap = 22;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      label: '${lot.name}, ${lot.availableSlots} free, open details',
      excludeSemantics: true,
      child: GestureDetector(
        onTap: onTap,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              constraints: const BoxConstraints(maxWidth: 200),
              padding: const EdgeInsets.fromLTRB(8, 4, 10, 6),
              decoration: BoxDecoration(
                color: palette.surface,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.teal),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    lot.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: palette.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${lot.availableSlots} free · '
                    '${Formatters.money(lot.pricePerHour)}/hr',
                    style: const TextStyle(
                      fontSize: 9,
                      color: AppColors.tealLight,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: pinGap),
          ],
        ),
      ),
    );
  }
}
