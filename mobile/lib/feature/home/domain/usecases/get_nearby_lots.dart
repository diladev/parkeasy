import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/domain/entities/nearby_lot.dart';
import 'package:mobile/feature/home/domain/repositories/home_repository.dart';

class GetNearbyLots extends UsecaseWithParams<List<NearbyLot>, NearbyLotsParams> {
  const GetNearbyLots(this._repository);
  final HomeRepository _repository;

  @override
  ResultFuture<List<NearbyLot>> call(NearbyLotsParams params) =>
      _repository.getNearbyLots(
        latitude: params.latitude,
        longitude: params.longitude,
        radiusKm: params.radiusKm,
      );
}

class NearbyLotsParams extends Equatable {
  const NearbyLotsParams({
    required this.latitude,
    required this.longitude,
    required this.radiusKm,
  });

  final double latitude;
  final double longitude;
  final double radiusKm;

  @override
  List<Object?> get props => [latitude, longitude, radiusKm];
}
