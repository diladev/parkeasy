import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/utils/formatters.dart';

/// The amount to top up: "IQD 10,000", typed with the number keyboard.
class TopUpAmountField extends StatelessWidget {
  const TopUpAmountField({
    super.key,
    required this.controller,
    required this.focusNode,
    required this.onChanged,
  });

  final TextEditingController controller;
  final FocusNode focusNode;

  /// The amount typed, in whole dinars; 0 when the field is empty.
  final ValueChanged<int> onChanged;

  /// The amount in a field's text, e.g. "10,000" -> 10000.
  static int parse(String text) =>
      int.tryParse(text.replaceAll(RegExp(r'[^0-9]'), '')) ?? 0;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return GestureDetector(
      // The whole box focuses the field, not only the digits.
      onTap: focusNode.requestFocus,
      child: Container(
        height: 54,
        padding: const EdgeInsets.symmetric(horizontal: 14),
        decoration: BoxDecoration(
          color: palette.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.teal),
        ),
        child: Row(
          children: [
            Text(
              l10n.iqd,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w500,
                color: AppColors.tealLight,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TextField(
                controller: controller,
                focusNode: focusNode,
                keyboardType: TextInputType.number,
                inputFormatters: [_DinarsFormatter()],
                cursorColor: AppColors.teal,
                onChanged: (text) => onChanged(parse(text)),
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w500,
                  color: palette.textPrimary,
                ),
                decoration: InputDecoration(
                  isCollapsed: true,
                  filled: false,
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  errorBorder: InputBorder.none,
                  disabledBorder: InputBorder.none,
                  focusedErrorBorder: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                  hintText: '0',
                  hintStyle: TextStyle(
                    fontSize: 26,
                    fontWeight: FontWeight.w500,
                    color: palette.textHint,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Digits only, grouped as they're typed: "25000" shows as "25,000".
class _DinarsFormatter extends TextInputFormatter {
  /// 7 digits: up to 9,999,999, past the largest top-up the server takes.
  static const int _maxDigits = 7;

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.isEmpty) return TextEditingValue.empty;
    if (digits.length > _maxDigits) return oldValue;

    final text = Formatters.dinars(int.parse(digits));
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}

/// Quick picks under the amount field.
class AmountPresets extends StatelessWidget {
  const AmountPresets({
    super.key,
    required this.amounts,
    required this.selected,
    required this.onSelected,
  });

  final List<int> amounts;
  final int selected;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < amounts.length; i++) ...[
          if (i > 0) const SizedBox(width: 8),
          Expanded(
            child: _PresetChip(
              amount: amounts[i],
              isSelected: amounts[i] == selected,
              onTap: () => onSelected(amounts[i]),
            ),
          ),
        ],
      ],
    );
  }
}

class _PresetChip extends StatelessWidget {
  const _PresetChip({
    required this.amount,
    required this.isSelected,
    required this.onTap,
  });

  final int amount;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Semantics(
      button: true,
      selected: isSelected,
      label: Formatters.money(amount),
      excludeSemantics: true,
      child: GestureDetector(
        onTap: onTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          height: 30,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isSelected ? AppColors.tealBg : palette.surface2,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: isSelected ? AppColors.teal : palette.border,
              width: isSelected ? 1 : 0.5,
            ),
          ),
          child: Text(
            Formatters.dinars(amount),
            style: TextStyle(
              fontSize: 11,
              color: isSelected ? AppColors.tealLight : palette.textMuted,
            ),
          ),
        ),
      ),
    );
  }
}
