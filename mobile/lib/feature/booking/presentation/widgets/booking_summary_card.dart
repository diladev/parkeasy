import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// One "label ... value" line of a [BookingSummaryCard].
class SummaryRow {
  const SummaryRow(this.label, this.value, {this.isControl = false});

  final String label;

  /// Usually a [Text] from [SummaryRow.text]; can be a control (a stepper).
  final Widget value;

  /// A control the user taps (vehicle picker, hours stepper): the line is
  /// [BookingSummaryCard.controlRowHeight] tall so its tap area fits, and the
  /// control sits on the right instead of in the value column.
  final bool isControl;

  static Widget text(BuildContext context, String value) => Text(
    value,
    maxLines: 1,
    overflow: TextOverflow.ellipsis,
    style: TextStyle(fontSize: 11, color: context.palette.textPrimary),
  );
}

/// The card listing a booking's details, with the amount on the last line.
///
/// Payment and confirmation use the same card with different spacing, so the
/// spacing is passed in.
class BookingSummaryCard extends StatelessWidget {
  const BookingSummaryCard({
    super.key,
    required this.rows,
    required this.totalLabel,
    required this.total,
    required this.valueColumn,
    required this.rowHeight,
    required this.lastRowHeight,
    required this.topPadding,
    this.bottomPadding = 23,
  });

  final List<SummaryRow> rows;
  final String totalLabel;

  /// "$4.00"
  final String total;

  /// Where the values start, from the card's left edge.
  final double valueColumn;
  final double rowHeight;

  /// The last text row is shorter: the divider sits close under it.
  final double lastRowHeight;
  final double topPadding;
  final double bottomPadding;

  /// Material's minimum touch target.
  static const double controlRowHeight = 48;

  static const double _sidePadding = 14;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final labelStyle = TextStyle(fontSize: 10, color: palette.textHint);

    Widget textLine(String label, Widget value, double height) => SizedBox(
      height: height,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: valueColumn - _sidePadding,
            child: Text(label, style: labelStyle),
          ),
          Expanded(child: value),
        ],
      ),
    );

    Widget controlLine(String label, Widget control) => SizedBox(
      height: controlRowHeight,
      child: Row(
        children: [
          Expanded(child: Text(label, style: labelStyle)),
          const SizedBox(width: 12),
          control,
        ],
      ),
    );

    return Container(
      padding: EdgeInsets.fromLTRB(
        _sidePadding,
        topPadding,
        _sidePadding,
        bottomPadding,
      ),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Column(
        children: [
          for (final (index, row) in rows.indexed)
            row.isControl
                ? controlLine(row.label, row.value)
                : textLine(
                    row.label,
                    row.value,
                    index == rows.length - 1 ? lastRowHeight : rowHeight,
                  ),
          Divider(height: 1, thickness: 1, color: palette.border),
          const SizedBox(height: 5),
          textLine(
            totalLabel,
            Text(
              total,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: AppColors.tealLight,
              ),
            ),
            15,
          ),
        ],
      ),
    );
  }
}
