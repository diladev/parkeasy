import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/parking/domain/repositories/parking_repository.dart';

/// Saves a lot to the favorites, or removes it.
class SetFavorite extends UsecaseWithParams<void, SetFavoriteParams> {
  const SetFavorite(this._repository);
  final ParkingRepository _repository;

  @override
  ResultVoid call(SetFavoriteParams params) =>
      _repository.setFavorite(params.lotId, isFavorite: params.isFavorite);
}

class SetFavoriteParams extends Equatable {
  const SetFavoriteParams(this.lotId, {required this.isFavorite});

  final int lotId;
  final bool isFavorite;

  @override
  List<Object?> get props => [lotId, isFavorite];
}
