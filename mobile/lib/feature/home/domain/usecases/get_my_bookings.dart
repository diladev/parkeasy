import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';
import 'package:mobile/feature/home/domain/repositories/home_repository.dart';

class GetMyBookings extends UsecaseWithoutParams<List<BookingSummary>> {
  const GetMyBookings(this._repository);
  final HomeRepository _repository;

  @override
  ResultFuture<List<BookingSummary>> call() => _repository.getMyBookings();
}
