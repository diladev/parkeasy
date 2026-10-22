import 'package:mobile/core/utils/typedef.dart';
import 'package:mobile/feature/booking/data/models/booking_model.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';

class BookingReceiptModel extends BookingReceipt {
  const BookingReceiptModel({
    required super.receiptNumber,
    required super.issuedAt,
    required super.paymentMethod,
    required super.subtotal,
    required super.refunded,
    required super.total,
    required super.booking,
  });

  /// The response of GET /booking/:id/receipt.
  factory BookingReceiptModel.fromMap(DataMap map) {
    int amount(String key) => (map[key] as num? ?? 0).round();

    return BookingReceiptModel(
      receiptNumber: map['receipt_number'] as String? ?? '',
      // The API sends UTC; the app shows local time.
      issuedAt: DateTime.parse(map['issued_at'] as String).toLocal(),
      paymentMethod: ReceiptPaymentMethod.fromApi(
        map['payment_method'] as String?,
      ),
      subtotal: amount('subtotal'),
      refunded: amount('refunded'),
      total: amount('total'),
      booking: BookingModel.fromMap(map['booking'] as DataMap),
    );
  }
}
