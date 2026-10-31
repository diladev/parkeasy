import 'package:flutter/material.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/parking/presentation/cubit/search_state.dart';

/// A lot in the search results: name, address and distance, free slots,
/// features and price.
class LotResultCard extends StatelessWidget {
  const LotResultCard({super.key, required this.result, required this.onTap});

  final SearchResult result;
  final VoidCallback onTap;

  /// The features shown next to the free slots; more wouldn't fit.
  static const int _maxTags = 2;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final lot = result.lot;
    final place = [
      if (lot.address.isNotEmpty) lot.address,
      Formatters.distance(result.distanceKm),
    ].join(' · ');

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: palette.border, width: 0.5),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 60,
              height: 60,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: AppColors.blue35,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'P',
                style: TextStyle(fontSize: 32, color: palette.textPrimary),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Text(
                          lot.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: palette.textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        l10n.perHourShort(Formatters.money(lot.pricePerHour)),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: palette.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    place,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(fontSize: 10, color: palette.textHint),
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: [
                      _FreeSlotsBadge(free: lot.availableSlots),
                      for (final label in lot.featureLabels.take(_maxTags))
                        _Tag(label: label),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// "12 free" in teal, few left in amber, none in red.
class _FreeSlotsBadge extends StatelessWidget {
  const _FreeSlotsBadge({required this.free});

  final int free;

  /// At or below this, the badge turns amber.
  static const int _fewLeft = 3;

  @override
  Widget build(BuildContext context) {
    final (label, background, foreground) = switch (free) {
      0 => (l10n.full, AppColors.red12, AppColors.red),
      <= _fewLeft => (l10n.freeCount(free), AppColors.amber12, AppColors.amber),
      _ => (l10n.freeCount(free), AppColors.tealBg, AppColors.tealLight),
    };

    return Container(
      height: 20,
      constraints: const BoxConstraints(minWidth: 60),
      padding: const EdgeInsets.symmetric(horizontal: 6),
      alignment: AlignmentDirectional.centerStart,
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(6),
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

class _Tag extends StatelessWidget {
  const _Tag({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 20,
      constraints: const BoxConstraints(minWidth: 64),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      alignment: AlignmentDirectional.centerStart,
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Text(
        label,
        style: TextStyle(fontSize: 9, color: palette.textMuted),
      ),
    );
  }
}
