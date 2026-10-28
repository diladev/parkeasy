import 'dart:convert';

import 'package:equatable/equatable.dart';
import 'package:mobile/core/utils/typedef.dart';

/*
 * What a stay costs: the same rules as the server (backend/src/parking/pricing.ts),
 * so the price on screen is the price charged.
 *
 * - every started hour is charged, at least one;
 * - each hour costs the price of the Iraq calendar day it starts on: a special
 *   price (Eid, Newroz...) if one covers that day, otherwise the normal price;
 * - a day's hours never cost more than that day's cap, if it has one.
 *
 * The server stays the judge: a booking answers with what was really charged.
 */

/// A different price for some days, both ends included.
class PriceOverride extends Equatable {
  const PriceOverride({
    required this.label,
    required this.startDate,
    required this.endDate,
    required this.pricePerHour,
    this.dailyCap,
  });

  /// What it's for, e.g. "Newroz".
  final String label;

  /// "2027-03-20": an Iraq calendar day.
  final String startDate;
  final String endDate;
  final int pricePerHour;

  /// The most one of these days costs; null for no cap.
  final int? dailyCap;

  factory PriceOverride.fromMap(DataMap map) => PriceOverride(
    label: map['label'] as String? ?? '',
    startDate: map['start_date'] as String,
    endDate: map['end_date'] as String,
    pricePerHour: (map['price_per_hour'] as num).round(),
    dailyCap: (map['daily_cap'] as num?)?.round(),
  );

  bool covers(String date) =>
      startDate.compareTo(date) <= 0 && date.compareTo(endDate) <= 0;

  @override
  List<Object?> get props => [label, startDate, endDate, pricePerHour, dailyCap];
}

/// The price on one day, and the special price it comes from (null: the normal one).
class DayPrice extends Equatable {
  const DayPrice({required this.pricePerHour, this.dailyCap, this.label});

  final int pricePerHour;
  final int? dailyCap;
  final String? label;

  @override
  List<Object?> get props => [pricePerHour, dailyCap, label];
}

/// One Iraq calendar day of a stay.
class PriceDay extends Equatable {
  const PriceDay({
    required this.date,
    required this.hours,
    required this.price,
    required this.amount,
    required this.isCapped,
  });

  final String date;

  /// Hours that start on this day.
  final int hours;
  final DayPrice price;
  final int amount;

  /// The cap brought this day's amount down.
  final bool isCapped;

  /// What these hours would cost without a cap.
  int get fullAmount => hours * price.pricePerHour;

  @override
  List<Object?> get props => [date, hours, price, amount, isCapped];
}

class PriceQuote extends Equatable {
  const PriceQuote({
    required this.hours,
    required this.amount,
    required this.days,
  });

  final int hours;
  final int amount;
  final List<PriceDay> days;

  /// A daily cap brought the price down.
  bool get isCapped => days.any((day) => day.isCapped);

  /// What the daily caps saved.
  int get capSaving =>
      days.fold(0, (sum, day) => sum + day.fullAmount - day.amount);

  /// The special prices the stay falls on, in order, each once.
  List<DayPrice> get specialPrices {
    final seen = <String>{};
    return [
      for (final day in days)
        if (day.price.label != null && seen.add(day.price.label!)) day.price,
    ];
  }

  @override
  List<Object?> get props => [hours, amount, days];
}

/// A lot's prices: hourly, the daily cap and special prices.
class PriceRules extends Equatable {
  const PriceRules({
    required this.pricePerHour,
    this.dailyCap,
    this.overrides = const [],
  });

  final int pricePerHour;

  /// The most one calendar day costs; null for no cap.
  final int? dailyCap;
  final List<PriceOverride> overrides;

  static const Duration _hour = Duration(hours: 1);

  /// Iraq is UTC+3 all year.
  static const Duration _iraqOffset = Duration(hours: 3);

  /// The rules a booking saved (`price_rules`), whether the API sent them
  /// as an object or as text; null if there are none.
  static PriceRules? tryParse(Object? value) {
    final map = switch (value) {
      final String text when text.isNotEmpty => jsonDecode(text),
      _ => value,
    };
    if (map is! Map) return null;
    return PriceRules(
      pricePerHour: (map['price_per_hour'] as num).round(),
      dailyCap: (map['daily_cap'] as num?)?.round(),
      overrides: [
        for (final rule in map['overrides'] as List<dynamic>? ?? const [])
          PriceOverride.fromMap(Map<String, dynamic>.from(rule as Map)),
      ],
    );
  }

  /// "2026-10-28": the Iraq calendar day [time] falls on.
  static String iraqDate(DateTime time) {
    final clock = time.toUtc().add(_iraqOffset);
    String two(int value) => value.toString().padLeft(2, '0');
    return '${clock.year}-${two(clock.month)}-${two(clock.day)}';
  }

  /// Every started hour, at least one: 10 min -> 1, 60 min -> 1, 61 min -> 2.
  static int chargedHours(DateTime start, DateTime end) {
    final ms = end.difference(start).inMilliseconds;
    if (ms <= 0) return 1;
    return (ms / _hour.inMilliseconds).ceil();
  }

  /// The price on [date] ("2026-10-28").
  DayPrice priceOn(String date) {
    for (final rule in overrides) {
      if (rule.covers(date)) {
        return DayPrice(
          pricePerHour: rule.pricePerHour,
          dailyCap: rule.dailyCap,
          label: rule.label,
        );
      }
    }
    return DayPrice(pricePerHour: pricePerHour, dailyCap: dailyCap);
  }

  /// The price at [time]: what one hour costs right then.
  DayPrice priceAt(DateTime time) => priceOn(iraqDate(time));

  /// What parking from [start] to [end] costs, day by day.
  PriceQuote priceStay(DateTime start, DateTime end) {
    final hours = chargedHours(start, end);
    final dates = <String>[];
    final hoursOn = <String, int>{};
    for (var hour = 0; hour < hours; hour++) {
      final date = iraqDate(start.add(_hour * hour));
      if (!hoursOn.containsKey(date)) dates.add(date);
      hoursOn[date] = (hoursOn[date] ?? 0) + 1;
    }

    final days = [
      for (final date in dates) _day(date, hoursOn[date]!),
    ];
    return PriceQuote(
      hours: hours,
      amount: days.fold(0, (sum, day) => sum + day.amount),
      days: days,
    );
  }

  /// What adding time costs: the stay's new price minus its price so far,
  /// so hours on a day already at its cap add nothing. Never negative.
  int extensionCost(DateTime start, DateTime oldEnd, DateTime newEnd) {
    final before = priceStay(start, oldEnd).amount;
    final after = priceStay(start, newEnd).amount;
    return after > before ? after - before : 0;
  }

  /// What [hours] hours from [from] would cost with no daily cap: to show
  /// what a cap saved on an extension.
  int uncappedCost(DateTime from, int hours) {
    var total = 0;
    for (var hour = 0; hour < hours; hour++) {
      total += priceAt(from.add(_hour * hour)).pricePerHour;
    }
    return total;
  }

  PriceDay _day(String date, int hours) {
    final price = priceOn(date);
    final full = hours * price.pricePerHour;
    final cap = price.dailyCap;
    final amount = cap != null && full > cap ? cap : full;
    return PriceDay(
      date: date,
      hours: hours,
      price: price,
      amount: amount,
      isCapped: amount < full,
    );
  }

  @override
  List<Object?> get props => [pricePerHour, dailyCap, overrides];
}
