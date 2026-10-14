import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/parking/domain/entities/parking_slot.dart';

/// "Pick a slot": the level switch, the slots of that level and the legend.
class SlotPicker extends StatelessWidget {
  const SlotPicker({
    super.key,
    required this.levels,
    required this.level,
    required this.slots,
    required this.selectedSlot,
    required this.onLevelChanged,
    required this.onSlotTap,
  });

  final List<String> levels;
  final String? level;

  /// The slots of [level].
  final List<ParkingSlot> slots;
  final ParkingSlot? selectedSlot;
  final ValueChanged<String> onLevelChanged;
  final ValueChanged<ParkingSlot> onSlotTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final currentLevel = level;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                'Pick a slot',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: palette.textMuted,
                ),
              ),
            ),
            if (currentLevel != null)
              _LevelButton(
                levels: levels,
                level: currentLevel,
                onChanged: onLevelChanged,
              ),
          ],
        ),
        const SizedBox(height: 12),
        if (slots.isEmpty)
          Text(
            'This lot has no slots yet.',
            style: TextStyle(fontSize: 11, color: palette.textHint),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: [
              for (final slot in slots)
                _SlotTile(
                  slot: slot,
                  isSelected: slot.id == selectedSlot?.id,
                  onTap: () => onSlotTap(slot),
                ),
            ],
          ),
        const SizedBox(height: 14),
        const _Legend(),
      ],
    );
  }
}

/// "Level 1". With more than one level, tapping it lists the others.
class _LevelButton extends StatelessWidget {
  const _LevelButton({
    required this.levels,
    required this.level,
    required this.onChanged,
  });

  final List<String> levels;
  final String level;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final button = Container(
      height: 22,
      constraints: const BoxConstraints(minWidth: 60),
      padding: const EdgeInsets.symmetric(horizontal: 8),
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.tealBg,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Text(
        'Level $level',
        style: const TextStyle(
          fontSize: 9,
          fontWeight: FontWeight.w500,
          color: AppColors.tealLight,
        ),
      ),
    );

    if (levels.length < 2) return button;

    return PopupMenuButton<String>(
      initialValue: level,
      onSelected: onChanged,
      color: palette.surface,
      padding: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      itemBuilder: (_) => [
        for (final option in levels)
          PopupMenuItem(
            value: option,
            height: 36,
            child: Text(
              'Level $option',
              style: TextStyle(
                fontSize: 12,
                color: option == level
                    ? AppColors.tealLight
                    : palette.textPrimary,
              ),
            ),
          ),
      ],
      child: button,
    );
  }
}

class _SlotTile extends StatelessWidget {
  const _SlotTile({
    required this.slot,
    required this.isSelected,
    required this.onTap,
  });

  final ParkingSlot slot;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (background, border, text) = switch ((isSelected, slot.isFree)) {
      (true, _) => (AppColors.teal, AppColors.teal, Colors.white),
      (false, true) => (palette.surface2, palette.border, palette.textHint),
      (false, false) => (
        _SlotColors.taken(palette),
        palette.border,
        palette.textHint,
      ),
    };

    return Semantics(
      button: slot.isFree,
      selected: isSelected,
      label: 'Slot ${slot.slotNumber}${slot.isFree ? '' : ', taken'}',
      child: GestureDetector(
        onTap: slot.isFree ? onTap : null,
        child: Container(
          width: 60,
          height: 26,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: background,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: border, width: 0.5),
          ),
          child: Text(slot.slotNumber, style: TextStyle(fontSize: 9, color: text)),
        ),
      ),
    );
  }
}

class _SlotColors {
  _SlotColors._();

  /// Barely there: a taken slot is almost the page background.
  static Color taken(AppPalette palette) =>
      palette.textPrimary.withValues(alpha: 0.03);
}

/// Free / Selected / Taken, lined up with the stat boxes above.
class _Legend extends StatelessWidget {
  const _Legend();

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    Widget item(Color color, String label) => SizedBox(
      width: 88,
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(3),
            ),
          ),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(fontSize: 9, color: palette.textHint)),
        ],
      ),
    );

    return Row(
      children: [
        item(palette.surface2, 'Free'),
        item(AppColors.teal, 'Selected'),
        item(_SlotColors.taken(palette), 'Taken'),
      ],
    );
  }
}
