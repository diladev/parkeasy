import 'dart:io';

import 'package:dartz/dartz.dart';
import 'package:mobile/core/errors/failure.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/directions/data/directions_url_builder.dart';
import 'package:mobile/feature/directions/domain/entities/map_app.dart';
import 'package:mobile/feature/directions/domain/repositories/directions_repository.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:url_launcher/url_launcher.dart';

/// Opens a link outside the app; false if nothing could. Injected so tests
/// can stand in for url_launcher.
typedef LinkOpener = Future<bool> Function(Uri uri);

Future<bool> openExternally(Uri uri) =>
    // externalApplication: an in-app browser couldn't hand over to Maps.
    launchUrl(uri, mode: LaunchMode.externalApplication);

class DirectionsRepositoryImpl implements DirectionsRepository {
  DirectionsRepositoryImpl({LinkOpener? open, DirectionsPlatform? platform})
    : _open = open ?? openExternally,
      _urls = DirectionsUrlBuilder(platform ?? _currentPlatform());

  final LinkOpener _open;
  final DirectionsUrlBuilder _urls;

  static DirectionsPlatform _currentPlatform() {
    if (!Platform.isIOS) return const DirectionsPlatform.android();
    // e.g. "Version 18.4 (Build 22E240)"
    final match = RegExp(
      r'(\d+)\.(\d+)',
    ).firstMatch(Platform.operatingSystemVersion);
    return DirectionsPlatform.ios(
      match == null
          ? null
          : (int.parse(match.group(1)!), int.parse(match.group(2)!)),
    );
  }

  @override
  List<MapApp> get availableApps => [
    MapApp.google,
    if (_urls.platform.isIos) MapApp.apple,
    MapApp.waze,
  ];

  @override
  ResultVoid openDirections(
    MapApp app,
    GeoPoint destination,
    String label,
  ) async {
    // Not canLaunchUrl: without extra manifest/plist entries it says false
    // even when the app is there. Trying each link in turn is reliable.
    for (final uri in _urls.candidates(app, destination, label)) {
      try {
        if (await _open(uri)) return const Right(null);
      } catch (_) {
        // Try the next link.
      }
    }
    return Left(
      APIFailure(message: "Couldn't open ${app.label}.", statusCode: 0),
    );
  }
}
