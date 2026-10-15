import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/feature/booking/domain/entities/booking_draft.dart';
import 'package:mobile/feature/booking/domain/usecases/create_booking.dart';
import 'package:mobile/feature/booking/domain/usecases/get_wallet_balance.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';
import 'package:mobile/feature/profile/domain/usecases/get_vehicles.dart';
import 'payment_state.dart';

/// The payment screen: how long to park, which vehicle, and paying from the
/// wallet.
class PaymentCubit extends Cubit<PaymentState> {
  PaymentCubit(
    this._getWalletBalance,
    this._getVehicles,
    this._createBooking, {
    required BookingDraft draft,
  }) : super(PaymentState(draft: draft));

  final GetWalletBalance _getWalletBalance;
  final GetVehicles _getVehicles;
  final CreateBooking _createBooking;

  /// The API's limit for one booking.
  static const int maxHours = 24;

  /// Loads the wallet balance and the user's vehicles (both needed to pay).
  Future<void> load() async {
    emit(state.copyWith(status: PaymentStatus.loading));

    final balanceRequest = _getWalletBalance();
    final vehiclesRequest = _getVehicles();
    final balance = await balanceRequest;
    final vehicles = await vehiclesRequest;

    final failure = balance.fold((f) => f, (_) => null) ??
        vehicles.fold((f) => f, (_) => null);
    if (failure != null) {
      emit(
        state.copyWith(
          status: PaymentStatus.failure,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      );
      return;
    }

    final list = vehicles.getOrElse(() => const []);
    emit(
      PaymentState(
        draft: state.draft,
        status: PaymentStatus.ready,
        durationHours: state.durationHours,
        balance: balance.getOrElse(() => 0),
        vehicles: list,
        vehicle: _vehicleToUse(list, state.vehicle),
        errorSerial: state.errorSerial,
      ),
    );
  }

  void changeDuration(int delta) {
    final hours = (state.durationHours + delta).clamp(1, maxHours);
    if (hours != state.durationHours) {
      emit(state.copyWith(durationHours: hours));
    }
  }

  void selectVehicle(Vehicle vehicle) =>
      emit(state.copyWith(vehicle: vehicle));

  Future<void> pay() async {
    final vehicle = state.vehicle;
    if (state.status != PaymentStatus.ready || vehicle == null) return;

    emit(state.copyWith(status: PaymentStatus.paying));
    final result = await _createBooking(
      CreateBookingParams(
        lotId: state.draft.lotId,
        slotId: state.draft.slotId,
        vehicleId: vehicle.id,
        durationHours: state.durationHours,
      ),
    );
    result.fold(
      (failure) => emit(
        state.copyWith(
          status: PaymentStatus.ready,
          errorMessage: failure.message,
          errorSerial: state.errorSerial + 1,
        ),
      ),
      (booking) =>
          emit(state.copyWith(status: PaymentStatus.paid, booking: booking)),
    );
  }

  /// Keeps the vehicle already picked; otherwise the default one, or the first.
  static Vehicle? _vehicleToUse(List<Vehicle> vehicles, Vehicle? current) {
    if (vehicles.isEmpty) return null;
    for (final vehicle in vehicles) {
      if (vehicle.id == current?.id) return vehicle;
    }
    for (final vehicle in vehicles) {
      if (vehicle.isDefault) return vehicle;
    }
    return vehicles.first;
  }
}
