import 'package:mobile/feature/profile/data/models/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

abstract class ProfileLocalDataSource {
  UserModel? getUser();
  Future<void> saveUser(UserModel user);
  Future<void> clearUser();
}

class ProfileLocalDataSourceImpl implements ProfileLocalDataSource {
  ProfileLocalDataSourceImpl(this._prefs);

  static const String _userKey = 'user';
  final SharedPreferences _prefs;

  @override
  UserModel? getUser() {
    final json = _prefs.getString(_userKey);
    if (json == null) return null;
    try {
      return UserModel.fromJson(json);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> saveUser(UserModel user) async {
    await _prefs.setString(_userKey, user.toJson());
  }

  @override
  Future<void> clearUser() async {
    await _prefs.remove(_userKey);
  }
}
