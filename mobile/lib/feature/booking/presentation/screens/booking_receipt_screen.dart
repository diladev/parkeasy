import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/injection_container.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';
import 'package:mobile/core/widgets/app_screen.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/booking/domain/entities/booking_receipt.dart';
import 'package:mobile/feature/booking/presentation/cubit/booking_receipt_cubit.dart';
import 'package:mobile/feature/booking/presentation/utils/receipt_pdf.dart';
import 'package:mobile/feature/booking/presentation/widgets/booking_actions.dart';
import 'package:mobile/feature/home/domain/entities/booking_summary.dart';
import 'package:printing/printing.dart';

/// What a finished booking cost, with a PDF to save or share.
class BookingReceiptScreen extends StatelessWidget {
  const BookingReceiptScreen({super.key, required this.bookingId});

  final int bookingId;

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => sl<BookingReceiptCubit>()..load(bookingId),
      child: AppScreen(
        topBar: const AppTopBar(title: 'Receipt'),
        body: BlocBuilder<BookingReceiptCubit, BookingReceiptState>(
          builder: (context, state) {
            final receipt = state.receipt;
            if (receipt != null) return _Receipt(receipt: receipt);
            if (state.status == BookingReceiptStatus.failure) {
              return AppErrorView(
                message: state.errorMessage ?? "Couldn't load this receipt.",
                onRetry: () =>
                    context.read<BookingReceiptCubit>().load(bookingId),
              );
            }
            return const Center(child: CircularProgressIndicator());
          },
        ),
      ),
    );
  }
}

class _Receipt extends StatelessWidget {
  const _Receipt({required this.receipt});

  final BookingReceipt receipt;

  String get _fileName => 'parkeasy-receipt-${receipt.receiptNumber}.pdf';

  /// The system print dialog, where "Save as PDF" downloads it.
  Future<void> _download(BuildContext context) => _withPdf(
    context,
    (pdf) => Printing.layoutPdf(onLayout: (_) => pdf, name: _fileName),
  );

  /// The system share sheet, with the PDF attached.
  Future<void> _share(BuildContext context) => _withPdf(
    context,
    (pdf) => Printing.sharePdf(bytes: pdf, filename: _fileName),
  );

  Future<void> _withPdf(
    BuildContext context,
    Future<Object?> Function(Uint8List pdf) use,
  ) async {
    try {
      await use(await buildReceiptPdf(receipt));
    } catch (_) {
      if (context.mounted) {
        context.showSnack("Couldn't create the PDF.", isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final booking = receipt.booking;
    final isCancelled = booking.status == BookingStatus.cancelled;

    return ListView(
      padding: const EdgeInsets.fromLTRB(22, 8, 22, 24),
      children: [
        _Header(receipt: receipt),
        const SizedBox(height: 16),
        const _SectionLabel('PARKING DETAILS'),
        const SizedBox(height: 5),
        _ReceiptCard(
          rows: [
            _Row('Location', booking.lotName),
            _Row('Address', booking.lotAddress),
            _Row('Slot', booking.slotLabel),
            _Row('Vehicle', booking.vehicleLabel),
          ],
        ),
        const SizedBox(height: 10),
        const _SectionLabel('SESSION'),
        const SizedBox(height: 5),
        _ReceiptCard(
          rows: [
            _Row('Entry', Formatters.dayAndTime(booking.startTime)),
            // A cancelled booking ended early; this is when it would have.
            _Row(
              isCancelled ? 'Booked until' : 'Exit',
              Formatters.dayAndTime(booking.endTime),
            ),
            _Row(
              'Duration',
              Formatters.duration(
                booking.endTime.difference(booking.startTime),
              ),
            ),
            _Row('Rate', '${Formatters.money(booking.pricePerHour)} / hr'),
          ],
        ),
        const SizedBox(height: 10),
        const _SectionLabel('PAYMENT'),
        const SizedBox(height: 5),
        _ReceiptCard(
          rows: [
            _Row('Subtotal', Formatters.money(receipt.subtotal)),
            // ParkEasy has no discounts or tax yet: both are always 0.
            _Row('Discount', Formatters.money(0)),
            _Row('Tax', Formatters.money(0)),
            if (receipt.refunded > 0)
              _Row(
                'Refunded',
                '-${Formatters.money(receipt.refunded)}',
                color: AppColors.tealLight,
              ),
            _Row(
              'Total',
              Formatters.money(receipt.total),
              color: AppColors.tealLight,
              isBold: true,
              dividerAbove: true,
            ),
            _Row('Paid with', receipt.paymentMethod.label),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(
              child: BookingActionButton(
                icon: LucideIcons.download,
                label: 'Download PDF',
                background: AppColors.teal,
                // Light on teal in both themes.
                foreground: AppColors.textPrimary,
                isBold: true,
                onTap: () => _download(context),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: BookingActionButton(
                icon: LucideIcons.share,
                label: 'Share',
                background: palette.surface,
                foreground: palette.textMuted,
                border: palette.border,
                onTap: () => _share(context),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// The receipt icon, the total and where the money ended up.
class _Header extends StatelessWidget {
  const _Header({required this.receipt});

  final BookingReceipt receipt;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final status = receipt.status;
    final (Color background, Color foreground) = switch (status) {
      ReceiptStatus.paid ||
      ReceiptStatus.refunded ||
      ReceiptStatus.partlyRefunded => (AppColors.tealBg, AppColors.tealLight),
      ReceiptStatus.cancelled => (AppColors.red12, AppColors.red),
    };
    final verb = receipt.subtotal > 0 ? 'Paid' : 'Booked';

    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.tealBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.teal),
          ),
          child: const Icon(
            LucideIcons.receipt200,
            size: 36,
            color: AppColors.teal,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          Formatters.money(receipt.total),
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w500,
            color: palette.textPrimary,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          '$verb · ${Formatters.readableDate(receipt.issuedAt)}',
          style: TextStyle(fontSize: 10, color: palette.textHint),
        ),
        const SizedBox(height: 8),
        Container(
          constraints: const BoxConstraints(minWidth: 44, minHeight: 20),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(7),
          ),
          child: Text(
            status.label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w500,
              color: foreground,
            ),
          ),
        ),
      ],
    );
  }
}

class _Row {
  const _Row(
    this.label,
    this.value, {
    this.color,
    this.isBold = false,
    this.dividerAbove = false,
  });

  final String label;
  final String value;

  /// Defaults to the primary text color.
  final Color? color;
  final bool isBold;
  final bool dividerAbove;
}

/// "label ... value" lines, 22 apart, without dividers.
class _ReceiptCard extends StatelessWidget {
  const _ReceiptCard({required this.rows});

  final List<_Row> rows;

  /// Where the values start, from the card's left edge.
  static const double _valueColumn = 186;
  static const double _sidePadding = 14;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      padding: const EdgeInsets.fromLTRB(_sidePadding, 10, _sidePadding, 11),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (final (index, row) in rows.indexed) ...[
            if (row.dividerAbove) ...[
              const SizedBox(height: 5),
              Divider(height: 1, thickness: 1, color: palette.border),
              const SizedBox(height: 3),
            ] else if (index > 0)
              const SizedBox(height: 9),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SizedBox(
                  width: _valueColumn - _sidePadding,
                  child: Text(
                    row.label,
                    style: TextStyle(fontSize: 10, color: palette.textHint),
                  ),
                ),
                Expanded(
                  child: Text(
                    row.value,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: row.isBold ? 12 : 11,
                      fontWeight: row.isBold
                          ? FontWeight.w500
                          : FontWeight.w400,
                      color: row.color ?? palette.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 9,
        fontWeight: FontWeight.w500,
        color: context.palette.textHint,
      ),
    );
  }
}
