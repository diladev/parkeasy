import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/home/presentation/cubit/home_state.dart';

/// A card in the "Your regulars" carousel: a drawing of a parking lot and its name.
class RegularLotCard extends StatelessWidget {
  const RegularLotCard({super.key, required this.lot, required this.onTap});

  final RegularLot lot;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 100,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: palette.border, width: 0.5),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 70, child: _LotIllustration()),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 4, 14, 0),
              child: Text(
                lot.name,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: palette.textPrimary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// The placeholder picture from the design: two pillars and a road, in the
/// card's own dark shades. Lots have no photos yet.
class _LotIllustration extends StatelessWidget {
  const _LotIllustration();

  static const Color _background = Color(0xFF1A1A22);
  static const Color _pillar = Color(0xFF2E2E38);
  static const Color _road = Color(0xFF22222A);

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(14),
      child: ColoredBox(
        color: _background,
        child: Stack(
          children: [
            const Positioned(
              left: 30,
              top: 0,
              bottom: 0,
              width: 10,
              child: ColoredBox(color: _pillar),
            ),
            const Positioned(
              right: 50,
              top: 0,
              bottom: 0,
              width: 10,
              child: ColoredBox(color: _pillar),
            ),
            const Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: 20,
              child: ColoredBox(color: _road),
            ),
            Positioned(
              left: 10,
              top: 8,
              child: Container(
                width: 100,
                height: 20,
                padding: const EdgeInsets.only(left: 8),
                alignment: Alignment.centerLeft,
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.55),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Text(
                  'Your Regulars',
                  style: TextStyle(fontSize: 9, color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
