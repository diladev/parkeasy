import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/domain/repositories/home_repository.dart';

class GetUnreadNotificationCount extends UsecaseWithoutParams<int> {
  const GetUnreadNotificationCount(this._repository);
  final HomeRepository _repository;

  @override
  ResultFuture<int> call() => _repository.getUnreadNotificationCount();
}
