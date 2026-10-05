import 'package:mobile/feature/auth/data/models/auth_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class AuthenticationLocalDataSource {
  AuthModel? getAuth();
  DateTime? getSavedAt();
  Future<void> saveAuth(AuthModel auth);
  Future<void> clearAuth();
}

class AuthenticationLocalDataSourceImpl
    implements AuthenticationLocalDataSource {
  AuthenticationLocalDataSourceImpl(this._prefs);

  static const String _authKey = 'auth';
  static const String _savedAtKey = 'auth_cached_at';
  final SharedPreferences _prefs;

  @override
  Future<void> clearAuth() async {
    await _prefs.remove(_authKey);
    await _prefs.remove(_savedAtKey);
  }

  @override
  AuthModel? getAuth() {
    final json = _prefs.getString(_authKey);
    if (json == null) return null;
    try {
      return AuthModel.fromJson(json);
    } catch (_) {
      return null;
    }
  }

  @override
  DateTime? getSavedAt() {
    final millis = _prefs.getInt(_savedAtKey);
    return millis == null ? null : DateTime.fromMillisecondsSinceEpoch(millis);
  }

  @override
  Future<void> saveAuth(AuthModel auth) async {
    await _prefs.setString(_authKey, auth.toJson());
    await _prefs.setInt(_savedAtKey, DateTime.now().millisecondsSinceEpoch);
  }
}
