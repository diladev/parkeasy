abstract class TokenProvider {
  Future<String?> getAccessToken();
  Future<String?> refreshAccessToken();
}
