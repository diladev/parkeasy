import 'package:mobile/core/constants/end_points.dart';
import 'package:mobile/core/network/api_client.dart';
import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/data/models/booking_model.dart';
import 'package:mobile/feature/booking/data/models/booking_receipt_model.dart';
import 'package:mobile/feature/booking/domain/entities/booking_page.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';

abstract class BookingRemoteDataSource {
  Future<BookingModel> createBooking({
    required int lotId,
    required int slotId,
    required int vehicleId,
    required int durationHours,
  });

  Future<int> getWalletBalance();

  Future<BookingPage> getBookings({BookingStatus? status, int page = 1});

  Future<BookingModel> getBooking(int bookingId);

  Future<BookingModel> extendBooking({
    required int bookingId,
    required int extraHours,
  });

  Future<int> cancelBooking(int bookingId);

  Future<BookingReceiptModel> getReceipt(int bookingId);
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
  Future<int> getWalletBalance() async {
    final response = await _api.get(kWallet);
    return (response.map['balance'] as num? ?? 0).round();
  }

  /// Bookings per page: enough to fill the screen a couple of times.
  static const int _pageSize = 20;

  @override
  Future<BookingPage> getBookings({BookingStatus? status, int page = 1}) async {
    final query = [
      'page=$page',
      'pageSize=$_pageSize',
      if (status != null) 'status=${status.name}',
    ].join('&');
    final response = await _api.get('$kBookings?$query');

    // { data: [...], meta: { currentPage, totalPages, ... }, links }
    final items = response.map['data'] as List<dynamic>? ?? const [];
    final meta = response.map['meta'] as DataMap? ?? const {};
    final currentPage = (meta['currentPage'] as num? ?? page).toInt();
    final totalPages = (meta['totalPages'] as num? ?? page).toInt();

    return BookingPage(
      bookings: items
          .map((item) => BookingModel.fromMap(item as DataMap))
          .toList(),
      hasMore: currentPage < totalPages,
    );
  }

  @override
  Future<BookingModel> getBooking(int bookingId) async {
    final response = await _api.get('$kBookings/$bookingId');
    return BookingModel.fromMap(response.map);
  }

  @override
  Future<BookingModel> extendBooking({
    required int bookingId,
    required int extraHours,
  }) async {
    final response = await _api.patch(
      '$kBookings/$bookingId/extend',
      body: {'extra_hours': extraHours, 'payment_method': 'wallet'},
    );
    // { message, booking }
    return BookingModel.fromMap(response.map['booking'] as DataMap);
  }

  @override
  Future<int> cancelBooking(int bookingId) async {
    final response = await _api.patch('$kBookings/$bookingId/cancel');
    // { message, refund }
    return (response.map['refund'] as num? ?? 0).round();
  }

  @override
  Future<BookingReceiptModel> getReceipt(int bookingId) async {
    final response = await _api.get('$kBookings/$bookingId/receipt');
    return BookingReceiptModel.fromMap(response.map);
  }
}
