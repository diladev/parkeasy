import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/directions/domain/entities/map_app.dart';
import 'package:mobile/feature/directions/domain/repositories/directions_repository.dart';
import 'package:mobile/feature/location/domain/entities/geo_point.dart';

class OpenDirections extends UsecaseWithParams<void, OpenDirectionsParams> {
  const OpenDirections(this._repository);
  final DirectionsRepository _repository;

  @override
  ResultVoid call(OpenDirectionsParams params) => _repository.openDirections(
    params.app,
    params.destination,
    params.label,
  );
}

class OpenDirectionsParams extends Equatable {
  const OpenDirectionsParams({
    required this.app,
    required this.destination,
    required this.label,
  });

  final MapApp app;
  final GeoPoint destination;

  /// The lot's name, shown by apps that support a label.
  final String label;

  @override
  List<Object?> get props => [app, destination, label];
}
