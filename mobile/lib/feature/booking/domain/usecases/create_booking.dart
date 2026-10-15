import 'package:equatable/equatable.dart';
import 'package:mobile/core/usecase/usecase.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/domain/entities/booking.dart';
import 'package:mobile/feature/booking/domain/repositories/booking_repository.dart';

class CreateBooking extends UsecaseWithParams<Booking, CreateBookingParams> {
  const CreateBooking(this._repository);
  final BookingRepository _repository;

  @override
  ResultFuture<Booking> call(CreateBookingParams params) =>
      _repository.createBooking(
        lotId: params.lotId,
        slotId: params.slotId,
        vehicleId: params.vehicleId,
        durationHours: params.durationHours,
      );
}

class CreateBookingParams extends Equatable {
  const CreateBookingParams({
    required this.lotId,
    required this.slotId,
    required this.vehicleId,
    required this.durationHours,
  });

  final int lotId;
  final int slotId;
  final int vehicleId;
  final int durationHours;

  @override
  List<Object?> get props => [lotId, slotId, vehicleId, durationHours];
}
