import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/directions/domain/entities/map_app.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';

abstract class DirectionsRepository {
  /// The map apps worth offering on this phone (Apple Maps only on iOS).
  List<MapApp> get availableApps;

  /// Opens [app] with a driving route to [destination]. Fails if no app or
  /// browser could open it.
  ResultVoid openDirections(MapApp app, GeoPoint destination, String label);
}
