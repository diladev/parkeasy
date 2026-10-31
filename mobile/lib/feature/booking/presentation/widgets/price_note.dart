import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/pricing/price_rules.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';

/// Why a price isn't simply hours × hourly price: a daily cap brought it
/// down, or a special price (Eid, Newroz...) applies. Nothing when neither.
class PriceNote extends StatelessWidget {
  const PriceNote({
    super.key,
    required this.capSaving,
    required this.specialPrices,
  });

  /// What the daily cap took off, in dinars.
  final int capSaving;
  final List<DayPrice> specialPrices;

  @override
  Widget build(BuildContext context) {
    final lines = [
      for (final price in specialPrices)
        (
          LucideIcons.tag,
          l10n.specialPrice(price.label!, Formatters.money(price.pricePerHour)),
        ),
      if (capSaving > 0)
        (
          LucideIcons.circleCheck,
          l10n.dailyCapSaved(Formatters.money(capSaving)),
        ),
    ];
    if (lines.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final (index, (icon, text)) in lines.indexed) ...[
          if (index > 0) const SizedBox(height: 4),
          Row(
            children: [
              Icon(icon, size: 12, color: AppColors.tealLight),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  text,
                  style: TextStyle(
                    fontSize: 10,
                    color: context.palette.textHint,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
