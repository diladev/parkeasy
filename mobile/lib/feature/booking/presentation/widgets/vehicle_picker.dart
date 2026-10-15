import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

/// A select box for the Vehicle line of the summary: the vehicle being booked
/// for, and a menu to switch to another one or add a new one.
///
/// The box looks 32 tall but the whole 48-tall line is its tap area.
class VehiclePicker extends StatelessWidget {
  const VehiclePicker({
    super.key,
    required this.vehicles,
    required this.vehicle,
    required this.onSelected,
    required this.onAdd,
  });

  final List<Vehicle> vehicles;
  final Vehicle? vehicle;
  final ValueChanged<Vehicle> onSelected;
  final VoidCallback onAdd;

  /// The visible box. Its right edge lines up with the + button, which sits
  /// [_edgeInset] inside its own 48×48 tap area.
  static const double width = 182;
  static const double _edgeInset = 8;

  /// The menu value for "Add a vehicle" (vehicle ids start at 1).
  static const int _addVehicle = -1;

  static String _label(Vehicle vehicle) =>
      '${vehicle.displayName} · ${vehicle.plateNumber}';

  @override
  Widget build(BuildContext context) {
    final current = vehicle;

    // Nothing to pick from: the box adds a vehicle straight away.
    if (current == null) {
      return Semantics(
        button: true,
        child: GestureDetector(
          onTap: onAdd,
          behavior: HitTestBehavior.opaque,
          child: const _SelectBox(
            label: 'Add a vehicle',
            icon: LucideIcons.plus,
            isAccent: true,
          ),
        ),
      );
    }

    final palette = context.palette;
    TextStyle itemStyle(bool isCurrent) => TextStyle(
      fontSize: 12,
      color: isCurrent ? AppColors.tealLight : palette.textPrimary,
    );

    return PopupMenuButton<int>(
      initialValue: current.id,
      tooltip: 'Change vehicle',
      color: palette.surface,
      padding: EdgeInsets.zero,
      position: PopupMenuPosition.under,
      constraints: const BoxConstraints(minWidth: width + _edgeInset),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      onSelected: (id) {
        if (id == _addVehicle) {
          onAdd();
          return;
        }
        onSelected(vehicles.firstWhere((option) => option.id == id));
      },
      itemBuilder: (_) => [
        for (final option in vehicles)
          PopupMenuItem(
            value: option.id,
            height: 44,
            child: Text(
              _label(option),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: itemStyle(option.id == current.id),
            ),
          ),
        const PopupMenuDivider(height: 1),
        PopupMenuItem(
          value: _addVehicle,
          height: 44,
          child: Row(
            children: [
              const Icon(
                LucideIcons.plus,
                size: 16,
                color: AppColors.tealLight,
              ),
              const SizedBox(width: 8),
              Text(
                'Add a vehicle',
                style: itemStyle(false).copyWith(color: AppColors.tealLight),
              ),
            ],
          ),
        ),
      ],
      child: _SelectBox(
        label: _label(current),
        icon: LucideIcons.chevronDown,
      ),
    );
  }
}

/// The 32-tall box, centred in a 48-tall tap area.
class _SelectBox extends StatelessWidget {
  const _SelectBox({
    required this.label,
    required this.icon,
    this.isAccent = false,
  });

  final String label;
  final IconData icon;

  /// Teal text, for "Add a vehicle".
  final bool isAccent;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    final color = isAccent ? AppColors.tealLight : null;

    // 48 tall to tap; the box inside is 32 tall (Center lets it be shorter).
    return SizedBox(
      width: VehiclePicker.width + VehiclePicker._edgeInset,
      height: 48,
      child: Padding(
        padding: const EdgeInsets.only(right: VehiclePicker._edgeInset),
        child: Center(
          child: Container(
            height: 32,
            padding: const EdgeInsets.only(left: 10, right: 8),
            decoration: BoxDecoration(
              color: palette.surface2,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: palette.border, width: 0.5),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 11,
                      color: color ?? palette.textPrimary,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                Icon(icon, size: 16, color: color ?? palette.textMuted),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
