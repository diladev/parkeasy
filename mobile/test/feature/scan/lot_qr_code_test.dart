import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/feature/scan/domain/lot_qr_code.dart';

void main() {
  test('reads the lot id from a ParkEasy code', () {
    expect(LotQrCode.parse('parkeasy://lot/1'), 1);
    expect(LotQrCode.parse('  parkeasy://lot/42 '), 42);
    expect(LotQrCode.parse(LotQrCode.forLot(7)), 7);
  });

  test('ignores every other code', () {
    for (final raw in [
      null,
      '',
      'https://parkeasy.app/lot/1',
      'parkeasy://booking/1',
      'parkeasy://lot/',
      'parkeasy://lot/0',
      'parkeasy://lot/-3',
      'parkeasy://lot/abc',
      'parkeasy://lot/1/extra',
      'WIFI:S:Cafe;T:WPA;P:secret;;',
    ]) {
      expect(LotQrCode.parse(raw), isNull, reason: '$raw');
    }
  });

  test('accepts the typed number under the code', () {
    expect(LotQrCode.parseTyped(' 12 '), 12);
    expect(LotQrCode.parseTyped('0'), isNull);
    expect(LotQrCode.parseTyped(''), isNull);
  });
}
