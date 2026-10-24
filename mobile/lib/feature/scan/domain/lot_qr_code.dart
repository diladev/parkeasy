/// What the QR sign at a lot's entrance holds: `parkeasy://lot/<id>`.
///
/// A custom scheme, so a phone camera app doesn't try to open it as a web
/// page, and any other QR code is clearly not ours. The demo signs are in
/// docs/demo-qr.
class LotQrCode {
  LotQrCode._();

  static const String scheme = 'parkeasy';

  static String forLot(int lotId) => '$scheme://lot/$lotId';

  /// The lot id in a scanned code, or null if it isn't a ParkEasy code.
  static int? parse(String? raw) {
    final uri = Uri.tryParse(raw?.trim() ?? '');
    if (uri == null || uri.scheme != scheme || uri.host != 'lot') return null;
    if (uri.pathSegments.length != 1) return null;
    return _validId(uri.pathSegments.single);
  }

  /// The number printed under the code, typed in by hand.
  static int? parseTyped(String text) => _validId(text.trim());

  static int? _validId(String text) {
    final id = int.tryParse(text);
    return id != null && id > 0 ? id : null;
  }
}
