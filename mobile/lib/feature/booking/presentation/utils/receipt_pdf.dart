import 'dart:typed_data';

import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

/// The receipt as an A5 PDF, built on the phone (no server needed).
///
/// It uses the PDF's built-in Helvetica, which covers Latin text only, so
/// a lot name in another script can't be drawn and building throws; the
/// screen shows an error then.
Future<Uint8List> buildReceiptPdf(BookingReceipt receipt) {
  final booking = receipt.booking;
  final isCancelled = booking.status == BookingStatus.cancelled;
  final document = pw.Document(
    title: 'ParkEasy receipt ${receipt.receiptNumber}',
    author: 'ParkEasy',
  );

  document.addPage(
    pw.Page(
      pageFormat: PdfPageFormat.a5,
      margin: const pw.EdgeInsets.all(32),
      build: (_) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.stretch,
        children: [
          pw.Row(
            children: [
              pw.Text(
                'ParkEasy',
                style: pw.TextStyle(
                  fontSize: 18,
                  fontWeight: pw.FontWeight.bold,
                  color: _teal,
                ),
              ),
              pw.Spacer(),
              pw.Text(
                'Receipt ${receipt.receiptNumber}',
                style: pw.TextStyle(fontSize: 10, color: _grey),
              ),
            ],
          ),
          pw.SizedBox(height: 20),
          pw.Text(
            Formatters.money(receipt.total),
            style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold),
          ),
          pw.SizedBox(height: 4),
          pw.Text(
            '${receipt.status.label} · ${_dateTime(receipt.issuedAt)}',
            style: pw.TextStyle(fontSize: 10, color: _grey),
          ),
          pw.SizedBox(height: 20),
          _section('PARKING DETAILS', [
            ('Location', booking.lotName),
            ('Address', booking.lotAddress),
            ('Slot', booking.slotLabel),
            ('Vehicle', booking.vehicleLabel),
          ]),
          _section('SESSION', [
            ('Entry', _dateTime(booking.startTime)),
            (
              isCancelled ? 'Booked until' : 'Exit',
              _dateTime(isCancelled ? booking.endTime : booking.finishedAt),
            ),
            (
              booking.endedEarly ? 'Booked' : 'Duration',
              Formatters.duration(
                booking.endTime.difference(booking.startTime),
              ),
            ),
            ('Rate', '${Formatters.money(booking.pricePerHour)} / hr'),
          ]),
          _section('PAYMENT', [
            ('Subtotal', Formatters.money(receipt.subtotal)),
            if (receipt.refunded > 0)
              ('Refunded', '-${Formatters.money(receipt.refunded)}'),
            ('Total', Formatters.money(receipt.total)),
            ('Paid with', receipt.paymentMethod.label),
          ]),
          pw.Spacer(),
          pw.Text(
            'Thank you for parking with ParkEasy.',
            textAlign: pw.TextAlign.center,
            style: pw.TextStyle(fontSize: 9, color: _grey),
          ),
        ],
      ),
    ),
  );
  return document.save();
}

final PdfColor _teal = PdfColor.fromInt(0xFF1D9E75);
final PdfColor _grey = PdfColor.fromInt(0xFF6B6A76);
final PdfColor _line = PdfColor.fromInt(0xFFE2E2E8);

/// "12 Oct, 2026 · 9:15 AM": a printed receipt needs the full date.
String _dateTime(DateTime time) =>
    '${Formatters.readableDate(time)} · ${Formatters.time(time)}';

pw.Widget _section(String title, List<(String, String)> rows) {
  return pw.Padding(
    padding: const pw.EdgeInsets.only(bottom: 14),
    child: pw.Column(
      crossAxisAlignment: pw.CrossAxisAlignment.stretch,
      children: [
        pw.Text(
          title,
          style: pw.TextStyle(
            fontSize: 8,
            fontWeight: pw.FontWeight.bold,
            color: _grey,
          ),
        ),
        pw.SizedBox(height: 4),
        for (final (label, value) in rows)
          pw.Container(
            padding: const pw.EdgeInsets.symmetric(vertical: 4),
            decoration: pw.BoxDecoration(
              border: pw.Border(
                bottom: pw.BorderSide(color: _line, width: 0.5),
              ),
            ),
            child: pw.Row(
              children: [
                pw.Expanded(
                  child: pw.Text(
                    label,
                    style: pw.TextStyle(fontSize: 10, color: _grey),
                  ),
                ),
                pw.Text(value, style: pw.TextStyle(fontSize: 10)),
              ],
            ),
          ),
      ],
    ),
  );
}
