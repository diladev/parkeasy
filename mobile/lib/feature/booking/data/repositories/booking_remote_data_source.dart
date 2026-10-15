import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/data/models/booking_model.dart';

abstract class BookingRemoteDataSource {
  Future<BookingModel> createBooking({
    required int lotId,
    required int slotId,
    required int vehicleId,
    required int durationHours,
  });

  Future<double> getWalletBalance();
}

class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  BookingRemoteDataSourceImpl(this._api);

  final ApiClient _api;

  @override
  Future<BookingModel> createBooking({
    required int lotId,
    required int slotId,
    required int vehicleId,
    required int durationHours,
  }) async {
    final response = await _api.post(
      kBookings,
      body: {
        'parking_lot_id': lotId,
        'parking_slot_id': slotId,
        'vehicle_id': vehicleId,
        'duration_hours': durationHours,
        // Cards aren't charged yet (no payment provider), so the app only
        // offers the wallet.
        'payment_method': 'wallet',
      },
    );
    // { message, booking }
    return BookingModel.fromMap(response.map['booking'] as DataMap);
  }

  @override
  Future<double> getWalletBalance() async {
    final response = await _api.get(kWallet);
    return (response.map['balance'] as num? ?? 0).toDouble();
  }
}
