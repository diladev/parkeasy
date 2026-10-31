import 'dart:async';

import 'package:dartz/dartz.dart';
import 'package:geolocator/geolocator.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/location/domain/entities/location_failure.dart';
import 'package:mobile/feature/location/domain/repositories/location_repository.dart';

/// The only class that uses geolocator. Foreground location only: it's read
/// while a map is on screen, never in the background.
class LocationRepositoryImpl implements LocationRepository {
  /// A first fix indoors can be slow; after this, the last known position
  /// is used if there is one.
  static const Duration _timeLimit = Duration(seconds: 15);

  @override
  ResultFuture<GeoPoint> getCurrentLocation({
    required bool askPermission,
  }) async {
    try {
      if (!await Geolocator.isLocationServiceEnabled()) {
        return Left(
          LocationFailure(
            LocationProblem.serviceDisabled,
            message: l10n.locationServiceOff,
          ),
        );
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied && askPermission) {
        // Android only reports "denied forever" here, never from the check.
        permission = await Geolocator.requestPermission();
      }
      switch (permission) {
        case LocationPermission.denied:
        case LocationPermission.unableToDetermine:
          return Left(
            LocationFailure(
              LocationProblem.permissionDenied,
              message: l10n.locationNotAllowed,
            ),
          );
        case LocationPermission.deniedForever:
          return Left(
            LocationFailure(
              LocationProblem.permissionDeniedForever,
              message: l10n.locationOffInSettings,
            ),
          );
        case LocationPermission.whileInUse:
        case LocationPermission.always:
          break;
      }

      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: _timeLimit,
        ),
      );
      return Right(GeoPoint(position.latitude, position.longitude));
    } on TimeoutException {
      final last = await _lastKnown();
      return last != null
          ? Right(last)
          : Left(
              LocationFailure(
                LocationProblem.timeout,
                message: l10n.locationTimeout,
              ),
            );
    } on LocationServiceDisabledException {
      return Left(
        LocationFailure(
          LocationProblem.serviceDisabled,
          message: l10n.locationServiceOff,
        ),
      );
    } on PermissionDeniedException {
      return Left(
        LocationFailure(
          LocationProblem.permissionDenied,
          message: l10n.locationNotAllowed,
        ),
      );
    } catch (_) {
      return Left(
        LocationFailure(LocationProblem.unknown, message: l10n.locationUnknown),
      );
    }
  }

  Future<GeoPoint?> _lastKnown() async {
    try {
      final position = await Geolocator.getLastKnownPosition();
      return position == null
          ? null
          : GeoPoint(position.latitude, position.longitude);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<void> requestPermission() async {
    try {
      if (await Geolocator.checkPermission() == LocationPermission.denied) {
        await Geolocator.requestPermission();
      }
    } catch (_) {
      // Nothing to do: the map works without location.
    }
  }

  @override
  Future<void> openAppSettings() => Geolocator.openAppSettings();

  @override
  Future<void> openLocationSettings() => Geolocator.openLocationSettings();
}
