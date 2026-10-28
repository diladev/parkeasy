import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/pricing/price_rules.dart';

/// Minutes after 12:00 on 27 Oct 2026, Iraq time (09:00 UTC). The same
/// cases as backend/src/parking/pricing.spec.ts, so both sides agree.
DateTime at(int minutes) =>
    DateTime.utc(2026, 10, 27, 9).add(Duration(minutes: minutes));
const hour = 60;

const plain = PriceRules(pricePerHour: 1500);
const capped = PriceRules(pricePerHour: 1500, dailyCap: 9000);
const eid = PriceOverride(
  label: 'Eid',
  startDate: '2026-10-28',
  endDate: '2026-10-29',
  pricePerHour: 2500,
  dailyCap: 15000,
);
const cappedWithEid = PriceRules(
  pricePerHour: 1500,
  dailyCap: 9000,
  overrides: [eid],
);

void main() {
  group('chargedHours', () {
    test('charges every started hour, and at least one', () {
      expect(PriceRules.chargedHours(at(0), at(0)), 1);
      expect(PriceRules.chargedHours(at(0), at(10)), 1);
      expect(PriceRules.chargedHours(at(0), at(60)), 1);
      expect(PriceRules.chargedHours(at(0), at(61)), 2);
      expect(PriceRules.chargedHours(at(30), at(0)), 1);
    });
  });

  group('iraqDate', () {
    test('uses Iraq time, whatever the phone is set to', () {
      expect(PriceRules.iraqDate(DateTime.utc(2026, 10, 27, 20, 59)), '2026-10-27');
      expect(PriceRules.iraqDate(DateTime.utc(2026, 10, 27, 21)), '2026-10-28');
    });
  });

  group('priceStay', () {
    test('multiplies the hours by the hourly price', () {
      final quote = plain.priceStay(at(0), at(95));
      expect(quote.hours, 2);
      expect(quote.amount, 3000);
      expect(quote.isCapped, isFalse);
      expect(quote.specialPrices, isEmpty);
    });

    test('stops at the daily cap, and says what it saved', () {
      final quote = capped.priceStay(at(0), at(11 * hour));
      expect(quote.amount, 9000);
      expect(quote.isCapped, isTrue);
      expect(quote.capSaving, 16500 - 9000);
      // Exactly at the cap is not "capped".
      expect(capped.priceStay(at(0), at(6 * hour)).isCapped, isFalse);
    });

    test('starts a new day, and a new cap, at midnight in Iraq', () {
      final quote = capped.priceStay(at(0), at(26 * hour));
      expect(
        quote.days.map((day) => (day.date, day.hours, day.amount)).toList(),
        [('2026-10-27', 12, 9000), ('2026-10-28', 14, 9000)],
      );
      expect(quote.amount, 18000);
    });

    test('charges a special price on its days, with its own cap', () {
      final quote = cappedWithEid.priceStay(at(10 * hour), at(14 * hour));
      expect(quote.days.map((day) => (day.date, day.amount)).toList(), [
        ('2026-10-27', 3000),
        ('2026-10-28', 5000),
      ]);
      expect(quote.amount, 8000);
      expect(quote.specialPrices.map((price) => price.label), ['Eid']);

      final wholeDay = cappedWithEid.priceStay(at(12 * hour), at(36 * hour));
      expect(wholeDay.amount, 15000);
      expect(wholeDay.isCapped, isTrue);
    });
  });

  group('extensionCost', () {
    test('charges the extra hours', () {
      expect(plain.extensionCost(at(0), at(2 * hour), at(4 * hour)), 3000);
    });

    test('charges nothing more once the day is at its cap', () {
      expect(capped.extensionCost(at(0), at(5 * hour), at(8 * hour)), 1500);
      expect(capped.extensionCost(at(0), at(6 * hour), at(9 * hour)), 0);
      expect(capped.uncappedCost(at(6 * hour), 3), 4500);
    });
  });

  group('tryParse', () {
    test('reads the rules a booking saved, as an object or as text', () {
      const map = {
        'price_per_hour': 1500,
        'daily_cap': 9000,
        'overrides': [
          {
            'label': 'Eid',
            'start_date': '2026-10-28',
            'end_date': '2026-10-29',
            'price_per_hour': 2500,
            'daily_cap': 15000,
          },
        ],
      };
      expect(PriceRules.tryParse(map), cappedWithEid);
      expect(
        PriceRules.tryParse(
          '{"price_per_hour":1500,"daily_cap":null,"overrides":[]}',
        ),
        plain,
      );
      expect(PriceRules.tryParse(null), isNull);
    });
  });
}
