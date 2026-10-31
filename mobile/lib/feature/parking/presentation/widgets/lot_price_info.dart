import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/pricing/price_rules.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';

/// Under the lot's stats: a special price today, the daily cap, and the next
/// special price coming up. Nothing when the lot has none of them.
class LotPriceInfo extends StatelessWidget {
  const LotPriceInfo({super.key, required this.rules, required this.now});

  final PriceRules rules;
  final DateTime now;

  /// "20 Mar, 2027", or "20 Mar, 2027 – 22 Mar, 2027".
  static String _days(PriceOverride rule) {
    String day(String date) => Formatters.readableDate(DateTime.parse(date));
    return rule.startDate == rule.endDate
        ? day(rule.startDate)
        : '${day(rule.startDate)} – ${day(rule.endDate)}';
  }

  @override
  Widget build(BuildContext context) {
    final todayDate = PriceRules.iraqDate(now);
    final today = rules.priceOn(todayDate);
    final cap = today.dailyCap;
    PriceOverride? next;
    for (final rule in rules.overrides) {
      if (rule.startDate.compareTo(todayDate) > 0) {
        next = rule;
        break;
      }
    }

    final lines = [
      if (today.label != null)
        (
          LucideIcons.tag,
          l10n.specialPriceToday(
            today.label!,
            Formatters.money(today.pricePerHour),
          ),
        ),
      if (cap != null)
        (
          LucideIcons.circleCheck,
          l10n.neverMoreThanADay(Formatters.money(cap)),
        ),
      if (next != null)
        (
          LucideIcons.calendarDays,
          l10n.specialPriceOn(
            next.label,
            Formatters.money(next.pricePerHour),
            _days(next),
          ),
        ),
    ];
    if (lines.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final (index, (icon, text)) in lines.indexed) ...[
            if (index > 0) const SizedBox(height: 5),
            Row(
              children: [
                Icon(icon, size: 12, color: AppColors.tealLight),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    text,
                    style: TextStyle(
                      fontSize: 10,
                      color: context.palette.textMuted,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
