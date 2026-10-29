import 'package:shared_preferences/shared_preferences.dart';

/// Whether this phone has seen the welcome screen, so it shows only once.
class OnboardingStore {
  OnboardingStore(this._prefs);

  final SharedPreferences _prefs;

  static const String _key = 'onboarding_seen';

  bool get isSeen => _prefs.getBool(_key) ?? false;

  Future<void> markSeen() => _prefs.setBool(_key, true);
}
