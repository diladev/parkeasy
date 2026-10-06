import 'package:flutter/material.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/core/widgets/app_widgets.dart';
import 'package:mobile/feature/profile/domain/entities/vehicle_entity.dart';

enum _VehicleAction { edit, makeDefault, delete }

/// One vehicle in My vehicles, with a menu to edit, make default or delete it.
class VehicleTile extends StatelessWidget {
  const VehicleTile({
    super.key,
    required this.vehicle,
    required this.isBusy,
    required this.onEdit,
    required this.onMakeDefault,
    required this.onDelete,
  });

  final Vehicle vehicle;

  /// True while an action on this vehicle is running.
  final bool isBusy;
  final VoidCallback onEdit;
  final VoidCallback onMakeDefault;
  final VoidCallback onDelete;

  IconData get _icon => switch (vehicle.type) {
    VehicleType.sedan => Icons.directions_car_rounded,
    VehicleType.suv => Icons.airport_shuttle_rounded,
    VehicleType.truck => Icons.local_shipping_rounded,
  };

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;

    return AppCard(
      onTap: onEdit,
      borderColor: vehicle.isDefault ? AppColors.teal : null,
      borderWidth: vehicle.isDefault ? 1 : null,
      child: Row(
        children: [
          AppIconBox(
            icon: _icon,
            color: vehicle.isDefault ? AppColors.tealLight : palette.textMuted,
            background: vehicle.isDefault ? AppColors.tealBg : null,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        vehicle.displayName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    ),
                    if (vehicle.isDefault) ...[
                      const SizedBox(width: 8),
                      const AppBadge(label: 'Default'),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${vehicle.year} · ${vehicle.color} · ${vehicle.type.label}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
                const SizedBox(height: 8),
                _PlateChip(plate: vehicle.plateNumber),
              ],
            ),
          ),
          if (isBusy)
            const Padding(
              padding: EdgeInsets.all(12),
              child: SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            PopupMenuButton<_VehicleAction>(
              icon: Icon(Icons.more_vert_rounded, color: palette.textMuted),
              color: palette.surface2,
              onSelected: (action) {
                switch (action) {
                  case _VehicleAction.edit:
                    onEdit();
                  case _VehicleAction.makeDefault:
                    onMakeDefault();
                  case _VehicleAction.delete:
                    onDelete();
                }
              },
              itemBuilder: (_) => [
                const PopupMenuItem(value: _VehicleAction.edit, child: Text('Edit')),
                if (!vehicle.isDefault)
                  const PopupMenuItem(
                    value: _VehicleAction.makeDefault,
                    child: Text('Make default'),
                  ),
                const PopupMenuItem(
                  value: _VehicleAction.delete,
                  child: Text('Delete', style: TextStyle(color: AppColors.red)),
                ),
              ],
            ),
        ],
      ),
    );
  }
}

/// The plate, drawn like a small number plate. Always left-to-right.
class _PlateChip extends StatelessWidget {
  const _PlateChip({required this.plate});

  final String plate;

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: palette.surface2,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: palette.border),
      ),
      child: Text(
        plate,
        textDirection: TextDirection.ltr,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 1,
          color: palette.textPrimary,
        ),
      ),
    );
  }
}
