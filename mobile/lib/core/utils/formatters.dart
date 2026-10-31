import 'package:mobile/core/l10n/l10n.dart';

/// Dates, times, money and distances in the app's language. Both languages
/// use Western digits; Kurdish uses the 24-hour clock and its own month
/// names, as the web app does.
class Formatters {
  Formatters._();

  /// "12 Oct, 2026" / "12 تشرینی یەکەم 2026".
  static String readableDate(DateTime date) =>
      l10n.dayMonthYear(date.day, l10n.monthShort(date.month), date.year);

  static String apiDate(DateTime date) =>
      '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

  /// "Today · 2:00–5:00 PM", "Yesterday · 11:00 AM–1:00 PM", "12 Oct · ...".
  static String bookingTime(DateTime start, DateTime end, {DateTime? now}) {
    return '${_dayLabel(start, now ?? DateTime.now())} · ${_timeRange(start, end)}';
  }

  /// "Today · 10:00 AM", "12 Oct · 9:30 PM".
  static String dayAndTime(DateTime time, {DateTime? now}) {
    final day = _dayLabel(time, now ?? DateTime.now());
    return '$day · ${Formatters.time(time)}';
  }

  /// "Today", "Yesterday", "12 Oct".
  static String day(DateTime date, {DateTime? now}) =>
      _dayLabel(date, now ?? DateTime.now());

  /// "9:15 AM" / "09:15".
  static String time(DateTime time) =>
      l10n.use24HourClock ? _clock24(time) : '${_clock(time)} ${_half(time)}';

  /// "1h 22m", "45m", "2h".
  static String duration(Duration duration) {
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;
    if (hours == 0) return l10n.minutesShort(minutes);
    return minutes == 0
        ? l10n.hoursShort(hours)
        : l10n.hoursMinutesShort(hours, minutes);
  }

  static String _dayLabel(DateTime date, DateTime now) {
    final day = DateTime(date.year, date.month, date.day);
    final today = DateTime(now.year, now.month, now.day);
    final days = (day.difference(today).inHours / 24).round();
    return switch (days) {
      0 => l10n.today,
      -1 => l10n.yesterday,
      1 => l10n.tomorrow,
      _ => '${date.day} ${l10n.monthShort(date.month)}',
    };
  }

  /// One AM/PM when both times share it: "2:00–5:00 PM".
  static String _timeRange(DateTime start, DateTime end) {
    if (l10n.use24HourClock) return '${_clock24(start)}–${_clock24(end)}';
    final sameHalf = (start.hour < 12) == (end.hour < 12);
    return sameHalf
        ? '${_clock(start)}–${_clock(end)} ${_half(end)}'
        : '${_clock(start)} ${_half(start)}–${_clock(end)} ${_half(end)}';
  }

  static String _clock(DateTime time) {
    final hour = time.hour % 12 == 0 ? 12 : time.hour % 12;
    return '$hour:${time.minute.toString().padLeft(2, '0')}';
  }

  static String _clock24(DateTime time) =>
      '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';

  static String _half(DateTime time) => time.hour < 12 ? l10n.am : l10n.pm;

  /// "1,500 IQD" / "1,500 د.ع". Amounts are whole Iraqi dinars, the API's
  /// currency.
  static String money(int amount) => '${dinars(amount)} ${l10n.iqd}';

  /// "+1,500 IQD" / "-1,500 IQD": money in or out of the wallet.
  static String signedMoney(int amount) =>
      amount < 0 ? money(amount) : '${ltr('+${dinars(amount)}')} ${l10n.iqd}';

  /// "1,500", for places that show the currency next to it.
  static String dinars(int amount) {
    final digits = amount.abs().toString();
    final grouped = digits.replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (_) => ',',
    );
    if (amount >= 0) return grouped;
    // Right to left, keep the minus sign in front of the digits.
    return l10n.isRtl ? ltr('-$grouped') : '-$grouped';
  }

  /// [text] kept left to right inside right-to-left text: phone numbers,
  /// plates, "+5,000". Unchanged in English.
  static String ltr(String text) => l10n.isRtl ? '\u2066$text\u2069' : text;

  /// "≈ 350 m", "≈ 2.4 km", "≈ 12 km": a straight-line distance, so never
  /// shown as exact or as a drive.
  static String approxDistance(double km) {
    if (km < 1) {
      final metres = ((km * 1000) / 50).round() * 50;
      return '≈ ${metres < 50 ? 50 : metres} ${l10n.metresUnit}';
    }
    return '≈ ${distance(km)}';
  }

  /// "0.3 km", "4.8 km", "12 km".
  static String distance(double km) => km < 10
      ? '${km.toStringAsFixed(1)} ${l10n.kmUnit}'
      : '${km.round()} ${l10n.kmUnit}';

  static String initials(String name) {
    return name
        .trim()
        .split(RegExp(r'\s+'))
        .where((part) => part.isNotEmpty)
        .take(2)
        .map((part) => String.fromCharCode(part.runes.first).toUpperCase())
        .join();
  }
}
