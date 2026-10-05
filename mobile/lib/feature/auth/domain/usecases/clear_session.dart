import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/auth/domain/repositories/auth_repository.dart';

class ClearSession extends UsecaseWithoutParams<void> {
  final AuthenticationRepository _repository;
  const ClearSession(this._repository);

  @override
  ResultVoid call() async => _repository.clearSession();
}
