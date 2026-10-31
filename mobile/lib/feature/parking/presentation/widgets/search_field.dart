import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';

/// The search box at the top of the search screen.
///
/// ✕ clears the text; with nothing typed it closes the screen.
class SearchField extends StatefulWidget {
  const SearchField({
    super.key,
    required this.initialText,
    required this.onChanged,
    required this.onSubmitted,
    required this.onClose,
  });

  final String initialText;
  final ValueChanged<String> onChanged;
  final VoidCallback onSubmitted;
  final VoidCallback onClose;

  @override
  State<SearchField> createState() => _SearchFieldState();
}

class _SearchFieldState extends State<SearchField> {
  late final TextEditingController _controller = TextEditingController(
    text: widget.initialText,
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _clearOrClose() {
    if (_controller.text.isEmpty) {
      widget.onClose();
      return;
    }
    _controller.clear();
    widget.onChanged('');
  }

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return Container(
      height: 44,
      padding: const EdgeInsetsDirectional.only(start: 9),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.teal),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.search600, size: 16, color: palette.textHint),
          const SizedBox(width: 12),
          Expanded(
            child: TextField(
              controller: _controller,
              autofocus: widget.initialText.isEmpty,
              textInputAction: TextInputAction.search,
              onChanged: widget.onChanged,
              onSubmitted: (_) => widget.onSubmitted(),
              style: TextStyle(fontSize: 12, color: palette.textPrimary),
              cursorColor: AppColors.teal,
              decoration: InputDecoration(
                isCollapsed: true,
                filled: false,
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                hintText: l10n.searchParkingSpots,
                hintStyle: TextStyle(fontSize: 12, color: palette.textHint),
              ),
            ),
          ),
          Semantics(
            button: true,
            label: l10n.clearSearch,
            child: GestureDetector(
              onTap: _clearOrClose,
              behavior: HitTestBehavior.opaque,
              child: SizedBox(
                width: 44,
                height: 44,
                child: Center(
                  child: Text(
                    '✕',
                    style: TextStyle(fontSize: 14, color: palette.textHint),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
