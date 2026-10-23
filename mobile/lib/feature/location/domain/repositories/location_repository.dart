import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';

abstract class LocationRepository {
  /// Where the phone is. With [askPermission], the system prompt is shown
  /// if the user hasn't decided yet; without, it only works if allowed.
  /// Fails with a LocationFailure.
  ResultFuture<GeoPoint> getCurrentLocation({required bool askPermission});

  /// Shows the system prompt, if the user hasn't decided yet.
  Future<void> requestPermission();

  /// This app's page in the Settings app (after "don't ask again").
  Future<void> openAppSettings();

  /// The phone's location settings (location services turned off).
  Future<void> openLocationSettings();
}
