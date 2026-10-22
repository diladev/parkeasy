import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/feature/booking/data/models/booking_receipt_model.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';

/// GET /booking/3/receipt from the demo data: cancelled within the free
/// window, so everything came back.
Map<String, dynamic> receiptJson({
  String status = 'cancelled',
  String paymentMethod = 'wallet',
  int subtotal = 4500,
  int refunded = 4500,
}) => {
  'receipt_number': 'PE-000003',
  'issued_at': '2026-10-17T16:00:00.000Z',
  'payment_method': paymentMethod,
  'subtotal': subtotal,
  'refunded': refunded,
  'total': subtotal - refunded,
  'booking': {
    'id': 3,
    'status': status,
    'parking_lot_id': 1,
    'start_time': '2026-10-17T16:00:00.000Z',
    'end_time': '2026-10-17T19:00:00.000Z',
    'duration_hours': 3,
    'price_per_hour': 1500,
    'total_cost': 4500,
    'payment_method': paymentMethod,
    'parking_lot': {
      'name': 'City Center Parking',
      'address': 'Salim Street, Sulaymaniyah',
    },
    'parking_slot': {'slot_number': 'A07', 'level': 'B1'},
    'vehicle': {
      'brand': 'Toyota',
      'model': 'Corolla',
      'license_plate': '22 SUL 48213',
    },
  },
};

void main() {
  test('reads the receipt the API sends', () {
    final receipt = BookingReceiptModel.fromMap(receiptJson());

    expect(receipt.receiptNumber, 'PE-000003');
    expect(receipt.subtotal, 4500);
    expect(receipt.refunded, 4500);
    expect(receipt.total, 0);
    expect(receipt.paymentMethod, ReceiptPaymentMethod.wallet);
    expect(receipt.issuedAt.isUtc, isFalse);
    expect(receipt.booking.lotName, 'City Center Parking');
    expect(receipt.booking.slotLabel, 'A07 · Level B1');
  });

  group('status', () {
    ReceiptStatus statusOf(Map<String, dynamic> json) =>
        BookingReceiptModel.fromMap(json).status;

    test('a completed booking is paid', () {
      expect(
        statusOf(receiptJson(status: 'completed', refunded: 0)),
        ReceiptStatus.paid,
      );
    });

    test('a full refund is refunded, part of one is partly refunded', () {
      expect(statusOf(receiptJson()), ReceiptStatus.refunded);
      expect(
        statusOf(receiptJson(refunded: 3000)),
        ReceiptStatus.partlyRefunded,
      );
    });

    test('cancelled with nothing back is cancelled', () {
      expect(
        statusOf(receiptJson(paymentMethod: 'card', refunded: 0)),
        ReceiptStatus.cancelled,
      );
    });
  });
}
