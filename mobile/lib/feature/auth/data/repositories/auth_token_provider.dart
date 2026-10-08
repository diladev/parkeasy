import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/network/token_provider.dart';
import 'package:mobile/feature/auth/data/models/auth_model.dart';
import 'package:mobile/feature/auth/data/repositories/auth_local_data_source.dart';
import 'package:mobile/feature/auth/data/repositories/auth_remote_data_source.dart';
import 'package:mobile/feature/profile/data/models/user_model.dart';
import 'package:mobile/feature/profile/data/repositories/profile_local_data_source.dart';

class AuthTokenProvider implements TokenProvider {
  AuthTokenProvider(this._remote, this._authCache, this._profileCache);

  static const Duration _margin = Duration(seconds: 30);

  final AuthenticationRemoteDataSource _remote;
  final AuthenticationLocalDataSource _authCache;
  final ProfileLocalDataSource _profileCache;

  Future<String?>? _refreshing;

  @override
  Future<String?> getAccessToken() async {
    final auth = _authCache.getAuth();
    if (auth == null) return null;
    if (!_isExpired(auth.accessTokenExpiresIn)) return auth.accessToken;
    return refreshAccessToken();
  }

  @override
  Future<String?> refreshAccessToken() {
    return _refreshing ??= _refresh().whenComplete(() => _refreshing = null);
  }

  Future<void> saveSession(UserModel user, AuthModel auth) async {
    await _authCache.saveAuth(auth);
    await _profileCache.saveUser(user);
  }

  Future<void> clearSession() async {
    await _authCache.clearAuth();
    await _profileCache.clearUser();
  }

  Future<String?> _refresh() async {
    final auth = _authCache.getAuth();
    if (auth == null || _isExpired(auth.refreshTokenExpiresIn)) {
      await clearSession();
      return null;
    }

    try {
      final (user, newAuth) = await _remote.refreshToken(
        refreshToken: auth.refreshToken,
      );
      await saveSession(user, newAuth);
      return newAuth.accessToken;
    } on APIException catch (e) {
      if (e.statusCode == 401 || e.statusCode == 403) {
        await clearSession();
        return null;
      }
      rethrow;
    }
  }

  bool _isExpired(int lifetimeSeconds) {
    final savedAt = _authCache.getSavedAt();
    if (savedAt == null) return true;
    final expiresAt = savedAt.add(Duration(seconds: lifetimeSeconds));
    return DateTime.now().isAfter(expiresAt.subtract(_margin));
  }
}
