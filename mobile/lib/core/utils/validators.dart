import 'package:mobile/core/l10n/l10n.dart';

/// Form validators that match the API's rules, so most mistakes are caught
/// before a request is sent. The API still checks everything.
class Validators {
  Validators._();

  static final RegExp _email = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
  static final RegExp _phone = RegExp(r'^\+?[0-9][0-9\s-]{6,19}$');
  // Letters (any alphabet), digits, spaces and dashes: 2-15 characters.
  static final RegExp _plate = RegExp(
    r'^[\p{L}\p{N}][\p{L}\p{N}\s-]{1,14}$',
    unicode: true,
  );

  static String? required(String? value) =>
      value == null || value.trim().isEmpty ? l10n.required : null;

  /// Required text between [min] and [max] characters.
  static String? Function(String?) text({int min = 1, required int max}) {
    return (value) {
      final text = value?.trim() ?? '';
      if (text.isEmpty) return l10n.required;
      if (text.length < min) return l10n.atLeastChars(min);
      if (text.length > max) return l10n.atMostChars(max);
      return null;
    };
  }

  static String? name(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return l10n.required;
    if (text.length < 2) return l10n.atLeastChars(2);
    if (text.length > 60) return l10n.atMostChars(60);
    return null;
  }

  static String? email(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return l10n.required;
    if (!_email.hasMatch(text)) return l10n.enterValidEmail;
    return null;
  }

  static String? phone(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return l10n.required;
    if (!_phone.hasMatch(text)) return l10n.enterValidPhone;
    return null;
  }

  /// The API's password policy: 8-64 characters, no spaces, an uppercase and a
  /// lowercase letter, a number and a symbol.
  static String? strongPassword(String? value) {
    final text = value ?? '';
    if (text.isEmpty) return l10n.required;
    if (text.length < 8) return l10n.atLeastChars(8);
    if (text.length > 64) return l10n.atMostChars(64);
    if (text.contains(RegExp(r'\s'))) return l10n.noSpaces;
    if (!text.contains(RegExp(r'[A-Z]'))) return l10n.addUppercase;
    if (!text.contains(RegExp(r'[a-z]'))) return l10n.addLowercase;
    if (!text.contains(RegExp(r'[0-9]'))) return l10n.addNumber;
    if (!text.contains(RegExp(r'[^A-Za-z0-9\s]'))) return l10n.addSymbol;
    return null;
  }

  /// The same password as [other].
  static String? Function(String?) matches(String Function() other) {
    return (value) {
      if (value == null || value.isEmpty) return l10n.required;
      return value == other() ? null : l10n.passwordsDontMatch;
    };
  }

  static String? plate(String? value) {
    final text = value?.trim().replaceAll(RegExp(r'\s+'), ' ') ?? '';
    if (text.isEmpty) return l10n.required;
    if (!_plate.hasMatch(text)) return l10n.plateCharacters;
    return null;
  }

  static String? vehicleYear(String? value) {
    final year = int.tryParse(value?.trim() ?? '');
    final max = DateTime.now().year + 1;
    if (year == null) return l10n.enterYear;
    if (year < 1950 || year > max) return l10n.yearBetween(max);
    return null;
  }
}
