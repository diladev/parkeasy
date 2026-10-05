import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/profile/domain/repositories/profile_repository.dart';

class DeleteAccount extends UsecaseWithParams<void, DeleteAccountParams> {
  const DeleteAccount(this._repository);
  final ProfileRepository _repository;

  @override
  ResultVoid call(DeleteAccountParams params) =>
      _repository.deleteAccount(password: params.password);
}

class DeleteAccountParams extends Equatable {
  const DeleteAccountParams({required this.password});

  final String password;

  @override
  List<Object?> get props => [password];
}
