import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import 'package:mobile/core/l10n/l10n.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/feature/location/domain/entities/location_failure.dart';

/// A small note under the search bar when the location isn't available,
/// with the button that fixes it. It never blocks the map.
class LocationBanner extends StatelessWidget {
  const LocationBanner({super.key, required this.problem, required this.onFix});

  final LocationProblem problem;
  final VoidCallback onFix;

  (String, String) get _text => switch (problem) {
    LocationProblem.serviceDisabled => (l10n.locationOffOnPhone, l10n.turnOn),
    LocationProblem.permissionDeniedForever => (
      l10n.locationOffForApp,
      l10n.settings,
    ),
    LocationProblem.permissionDenied => (
      l10n.seeNearestSpots,
      l10n.useMyLocation,
    ),
    LocationProblem.timeout ||
    LocationProblem.unknown => (l10n.couldntFindLocation, l10n.tryAgain),
  };

  @override
  Widget build(BuildContext context) {
    final palette = context.palette;
    final (message, action) = _text;

    return Container(
      padding: const EdgeInsetsDirectional.fromSTEB(10, 6, 4, 6),
      decoration: BoxDecoration(
        color: palette.surface,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: palette.border, width: 0.5),
      ),
      child: Row(
        children: [
          Icon(LucideIcons.mapPinOff, size: 14, color: palette.textHint),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: TextStyle(fontSize: 10, color: palette.textMuted),
            ),
          ),
          TextButton(
            onPressed: onFix,
            style: TextButton.styleFrom(
              minimumSize: const Size(48, 32),
              padding: const EdgeInsets.symmetric(horizontal: 8),
            ),
            child: Text(
              action,
              style: const TextStyle(fontSize: 10, color: AppColors.teal),
            ),
          ),
        ],
      ),
    );
  }
}
