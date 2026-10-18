import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/wallet/domain/entities/top_up.dart';
import 'package:mobile/feature/wallet/domain/repositories/wallet_repository.dart';

/// Approves or declines a payment in the built-in test bank, as the
/// customer would in the FIB app.
class DecideTestPayment
    extends UsecaseWithParams<void, DecideTestPaymentParams> {
  const DecideTestPayment(this._repository);
  final WalletRepository _repository;

  @override
  ResultVoid call(DecideTestPaymentParams params) =>
      _repository.decideTestPayment(params.topUp, approve: params.approve);
}

class DecideTestPaymentParams extends Equatable {
  const DecideTestPaymentParams({required this.topUp, required this.approve});

  final TopUp topUp;
  final bool approve;

  @override
  List<Object?> get props => [topUp, approve];
}
