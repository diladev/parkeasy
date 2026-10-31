import 'package:flutter/material.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/map/parking_pin.dart';
import 'package:mobile/feature/map/presentation/cubit/map_state.dart';

/// "Nearby spots": the lots as a list under the map. Drag it up for more.
class NearbySheet extends StatelessWidget {
  const NearbySheet({
    super.key,
    required this.lots,
    required this.hasLocation,
    required this.onSelect,
  });

  final List<MapLot> lots;

  /// Without the user's location there are no distances to show.
  final bool hasLocation;
  final ValueChanged<MapLot> onSelect;

  static const double minSize = 0.24;
  static const double maxSize = 0.6;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return DraggableScrollableSheet(
      initialChildSize: minSize,
      minChildSize: minSize,
      maxChildSize: maxSize,
      builder: (context, controller) => DecoratedBox(
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
          border: Border.all(color: palette.border, width: 0.5),
        ),
        child: ListView(
          controller: controller,
          padding: const EdgeInsets.fromLTRB(14, 10, 14, 16),
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
            const SizedBox(height: 12),
            Text(
              hasLocation ? l10n.nearbySpots : l10n.parkingInSulaymaniyah,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: palette.textMuted,
              ),
            ),
            const SizedBox(height: 4),
            if (lots.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Text(
                  l10n.noParkingLotsYet,
                  style: TextStyle(fontSize: 11, color: palette.textHint),
                ),
              ),
            for (final (index, lot) in lots.indexed) ...[
              if (index > 0)
                Divider(height: 1, thickness: 1, color: palette.border),
              _NearbyRow(lot: lot, onTap: () => onSelect(lot)),
            ],
          ],
        ),
      ),
    );
  }
}

class _NearbyRow extends StatelessWidget {
  const _NearbyRow({required this.lot, required this.onTap});

  final MapLot lot;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final summary = lot.lot;
    final color = ParkingPin.colorFor(summary.availableSlots);
    final distance = lot.distanceKm;
    final free = summary.availableSlots == 0
        ? l10n.full
        : l10n.freeCount(summary.availableSlots);

    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 10),
        child: Row(
          children: [
            Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(color: color, shape: BoxShape.circle),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    summary.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: palette.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text.rich(
                    TextSpan(
                      children: [
                        TextSpan(
                          text: free,
                          style: TextStyle(color: color),
                        ),
                        if (distance != null)
                          TextSpan(
                            text: ' · ${Formatters.approxDistance(distance)}',
                            style: TextStyle(color: palette.textHint),
                          ),
                      ],
                    ),
                    style: const TextStyle(fontSize: 10),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Text(
              l10n.perHourShort(Formatters.money(summary.pricePerHour)),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: palette.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
