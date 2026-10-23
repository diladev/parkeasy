import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';
import 'package:mobile/feature/location/domain/repositories/location_repository.dart';

/// The phone's location; the param says whether the user may be asked.
class GetCurrentLocation extends UsecaseWithParams<GeoPoint, bool> {
  const GetCurrentLocation(this._repository);
  final LocationRepository _repository;

  @override
  ResultFuture<GeoPoint> call(bool askPermission) =>
      _repository.getCurrentLocation(askPermission: askPermission);
}
