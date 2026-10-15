import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

class GetWalletBalance extends UsecaseWithoutParams<double> {
  const GetWalletBalance(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<double> call() => _repository.getWalletBalance();
}
