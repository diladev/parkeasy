import 'package:mobile/core/errors/failure.dart';

/// Why the phone's location isn't available.
enum LocationProblem {
  /// Location services are turned off for the whole phone.
  serviceDisabled,

  /// The user hasn't allowed it (yet); asking again is possible.
  permissionDenied,

  /// The user said no for good; only the Settings app can change it.
  permissionDeniedForever,

  /// No position in time (indoors, or the first fix is slow).
  timeout,
  unknown,
}

class LocationFailure extends Failure {
  const LocationFailure(this.problem, {required super.message})
    : super(statusCode: 0);

  final LocationProblem problem;

  @override
  List<Object?> get props => [...super.props, problem];
}
