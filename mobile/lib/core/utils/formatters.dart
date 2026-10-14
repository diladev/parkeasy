class Formatters {
  Formatters._();

  static const List<String> _months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  static String readableDate(DateTime date) =>
      '${date.day} ${_months[date.month - 1]}, ${date.year}';

  static String apiDate(DateTime date) =>
      '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

  /// "Today · 2:00–5:00 PM", "Yesterday · 11:00 AM–1:00 PM", "12 Oct · ...".
  static String bookingTime(DateTime start, DateTime end, {DateTime? now}) {
    return '${_dayLabel(start, now ?? DateTime.now())} · ${_timeRange(start, end)}';
  }

  static String _dayLabel(DateTime date, DateTime now) {
    final day = DateTime(date.year, date.month, date.day);
    final today = DateTime(now.year, now.month, now.day);
    final days = (day.difference(today).inHours / 24).round();
    return switch (days) {
      0 => 'Today',
      -1 => 'Yesterday',
      1 => 'Tomorrow',
      _ => '${date.day} ${_months[date.month - 1]}',
    };
  }

  /// One AM/PM when both times share it: "2:00–5:00 PM".
  static String _timeRange(DateTime start, DateTime end) {
    final sameHalf = (start.hour < 12) == (end.hour < 12);
    return sameHalf
        ? '${_clock(start)}–${_clock(end)} ${_half(end)}'
        : '${_clock(start)} ${_half(start)}–${_clock(end)} ${_half(end)}';
  }

  static String _clock(DateTime time) {
    final hour = time.hour % 12 == 0 ? 12 : time.hour % 12;
    return '$hour:${time.minute.toString().padLeft(2, '0')}';
  }

  static String _half(DateTime time) => time.hour < 12 ? 'AM' : 'PM';

  /// "$2.00"
  static String money(double amount) => '\$${amount.toStringAsFixed(2)}';

  /// "$2" for whole amounts, otherwise "$1.50".
  static String shortMoney(double amount) => amount == amount.roundToDouble()
      ? '\$${amount.toStringAsFixed(0)}'
      : money(amount);

  /// "0.3 km", "4.8 km", "12 km".
  static String distance(double km) =>
      km < 10 ? '${km.toStringAsFixed(1)} km' : '${km.round()} km';

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
