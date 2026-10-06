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
      value == null || value.trim().isEmpty ? 'Required' : null;

  /// Required text between [min] and [max] characters.
  static String? Function(String?) text({int min = 1, required int max}) {
    return (value) {
      final text = value?.trim() ?? '';
      if (text.isEmpty) return 'Required';
      if (text.length < min) return 'At least $min characters';
      if (text.length > max) return 'At most $max characters';
      return null;
    };
  }

  static String? name(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Required';
    if (text.length < 2) return 'At least 2 characters';
    if (text.length > 60) return 'At most 60 characters';
    return null;
  }

  static String? email(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Required';
    if (!_email.hasMatch(text)) return 'Enter a valid email';
    return null;
  }

  static String? phone(String? value) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return 'Required';
    if (!_phone.hasMatch(text)) return 'Enter a valid phone number';
    return null;
  }

  /// The API's password policy: 8-64 characters, no spaces, an uppercase and a
  /// lowercase letter, a number and a symbol.
  static String? strongPassword(String? value) {
    final text = value ?? '';
    if (text.isEmpty) return 'Required';
    if (text.length < 8) return 'At least 8 characters';
    if (text.length > 64) return 'At most 64 characters';
    if (text.contains(RegExp(r'\s'))) return 'No spaces';
    if (!text.contains(RegExp(r'[A-Z]'))) return 'Add an uppercase letter';
    if (!text.contains(RegExp(r'[a-z]'))) return 'Add a lowercase letter';
    if (!text.contains(RegExp(r'[0-9]'))) return 'Add a number';
    if (!text.contains(RegExp(r'[^A-Za-z0-9\s]')))
      return 'Add a symbol, e.g. ! or #';
    return null;
  }

  static String? Function(String?) matches(
    String Function() other, {
    String message = 'Passwords do not match',
  }) {
    return (value) {
      if (value == null || value.isEmpty) return 'Required';
      return value == other() ? null : message;
    };
  }

  static String? plate(String? value) {
    final text = value?.trim().replaceAll(RegExp(r'\s+'), ' ') ?? '';
    if (text.isEmpty) return 'Required';
    if (!_plate.hasMatch(text))
      return 'Letters, numbers, spaces and dashes only';
    return null;
  }

  static String? vehicleYear(String? value) {
    final year = int.tryParse(value?.trim() ?? '');
    final max = DateTime.now().year + 1;
    if (year == null) return 'Enter a year';
    if (year < 1950 || year > max) return 'Between 1950 and $max';
    return null;
  }
}
