import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/utils/formatters.dart';

void main() {
  group('Formatters.money', () {
    test('shows whole Iraqi dinars with thousands separators', () {
      expect(Formatters.money(0), '0 IQD');
      expect(Formatters.money(750), '750 IQD');
      expect(Formatters.money(1500), '1,500 IQD');
      expect(Formatters.money(26000), '26,000 IQD');
      expect(Formatters.money(1000000), '1,000,000 IQD');
    });
  });

  group('Formatters.dinars', () {
    test('groups digits without the currency', () {
      expect(Formatters.dinars(999), '999');
      expect(Formatters.dinars(1000), '1,000');
      expect(Formatters.dinars(1234567), '1,234,567');
    });

    test('keeps the sign of a negative amount', () {
      expect(Formatters.dinars(-4500), '-4,500');
    });
  });
}
