import 'package:shared_preferences/shared_preferences.dart';

class AppLanguage {
  AppLanguage(this._prefs);

  final SharedPreferences _prefs;

  static const String _key = 'app_language';
  static const List<String> supported = ['en', 'ckb'];
  static const String fallback = 'en';

  String get code {
    final saved = _prefs.getString(_key);
    return supported.contains(saved) ? saved! : fallback;
  }

  Future<void> setCode(String code) async {
    if (supported.contains(code)) {
      await _prefs.setString(_key, code);
    }
  }
}
