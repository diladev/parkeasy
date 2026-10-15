import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// "label ... value" lines with a divider between each, for booking details.
class BookingInfoCard extends StatelessWidget {
  const BookingInfoCard({super.key, required this.rows});

  /// (label, value) pairs.
  final List<(String, String)> rows;

  /// Where the values start, from the card's left edge.
  static const double _valueColumn = 186;
  static const double _sidePadding = 14;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      padding: const EdgeInsets.fromLTRB(_sidePadding, 12, _sidePadding, 14),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Column(
        children: [
          for (final (index, (label, value)) in rows.indexed) ...[
            if (index > 0) ...[
              Divider(height: 1, thickness: 1, color: palette.border),
              const SizedBox(height: 5),
            ],
            SizedBox(
              height: 18,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: _valueColumn - _sidePadding,
                    child: Text(
                      label,
                      style: TextStyle(fontSize: 10, color: palette.textHint),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      value,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontSize: 11,
                        color: palette.textPrimary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
