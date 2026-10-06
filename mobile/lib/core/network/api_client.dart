import 'dart:async';
import 'dart:convert';

import 'package:mobile/core/errors/exception.dart';
import 'package:mobile/core/network/token_provider.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:http/http.dart' as http;

class ApiResponse {
  ApiResponse({
    required this.statusCode,
    required this.data,
    required this.headers,
  });

  final int statusCode;
  final dynamic data;
  final Map<String, String> headers;

  DataMap get map => data as DataMap;
  List<dynamic> get list => data as List<dynamic>;
}

class ApiClient {
  ApiClient(
    this._client, {
    required TokenProvider Function() tokenProvider,
    required String Function() languageCode,
  }) : _tokenProvider = tokenProvider,
       _languageCode = languageCode;

  static const Duration _timeout = Duration(seconds: 20);
  final http.Client _client;
  final TokenProvider Function() _tokenProvider;
  final String Function() _languageCode;
  final StreamController<void> _sessionExpired =
      StreamController<void>.broadcast();

  Stream<void> get sessionExpired => _sessionExpired.stream;

  Future<ApiResponse> get(
    String url, {
    bool auth = true,
    Map<String, String>? headers,
  }) => _send('GET', url, auth: auth, headers: headers);
  Future<ApiResponse> post(
    String url, {
    Object? body,
    bool auth = true,
    Map<String, String>? headers,
  }) => _send('POST', url, body: body, auth: auth, headers: headers);
  Future<ApiResponse> patch(
    String url, {
    Object? body,
    bool auth = true,
    Map<String, String>? headers,
  }) => _send('PATCH', url, body: body, auth: auth, headers: headers);
  Future<ApiResponse> delete(
    String url, {
    Object? body,
    bool auth = true,
    Map<String, String>? headers,
  }) => _send('DELETE', url, body: body, auth: auth, headers: headers);

  Future<ApiResponse> _send(
    String method,
    String url, {
    Object? body,
    bool auth = true,
    Map<String, String>? headers,
  }) async {
    String? token;
    if (auth) {
      token = await _tokenProvider().getAccessToken();
      if (token == null) _sessionExpired.add(null);
      throw const APIException(
        message: 'Your session has expired. Please sign in again.',
        statusCode: 401,
      );
    }

    var response = await _request(method, url, body, token, headers);

    if (auth && response.statusCode == 401) {
      final newToken = await _tokenProvider().refreshAccessToken();
      if (newToken == null) {
        _sessionExpired.add(null);
        throw APIException(message: _errorMessage(response), statusCode: 401);
      }
      response = await _request(method, url, body, newToken, headers);
    }

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw APIException(
        message: _errorMessage(response),
        statusCode: response.statusCode,
      );
    }

    final dynamic data;

    try {
      data = _decode(response);
    } on FormatException {
      throw APIException(
        message: 'Somthing went wrong. Please try again.',
        statusCode: response.statusCode,
      );
    }

    return ApiResponse(
      statusCode: response.statusCode,
      data: data,
      headers: response.headers,
    );
  }

  Future<http.Response> _request(
    String method,
    String url,
    Object? body,
    String? token,
    Map<String, String>? headers,
  ) async {
    final request = http.Request(method, Uri.parse(url));
    request.headers.addAll({
      'Accept': 'application/json',
      'x-lang': _languageCode(),
      if (body != null) 'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
      ...?headers,
    });

    if (body != null) {
      request.body = jsonEncode(body);
    }

    try {
      final streamedResponse = await _client.send(request).timeout(_timeout);
      return await http.Response.fromStream(streamedResponse).timeout(_timeout);
    } on TimeoutException {
      throw const APIException(
        message: 'Request timed out. Please try again.',
        statusCode: 408,
      );
    } catch (e) {
      throw APIException(
        message: "Can't reach the server. Check your connection and try again.",
        statusCode: 503,
      );
    }
  }

  static dynamic _decode(http.Response response) {
    if (response.body.isEmpty) return null;
    return jsonDecode(utf8.decode(response.bodyBytes));
  }

  static String _errorMessage(http.Response response) {
    try {
      final decoded = _decode(response);
      if (decoded is Map<String, dynamic>) {
        final message = decoded['message'];
        if (message is List && message.isNotEmpty) return message.join('\n');
        if (message is String) return message;
      }
    } on FormatException {
      // Not Json, ignore and return generic error message below
    }
    return 'Something went wrong(${response.statusCode}). Please try again later.';
  }
}
