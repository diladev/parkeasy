import 'package:flutter/material.dart';
import 'package:mobile/core/config/map_config.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:mobile/core/l10n/l10n.dart';

/// "© OpenStreetMap contributors", always visible and linked to the
/// copyright page, as the OSM attribution guidelines require. Place it where
/// no sheet or button covers it.
class MapAttribution extends StatelessWidget {
  const MapAttribution({super.key});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      link: true,
      label: l10n.mapData(MapConfig.attribution),
      excludeSemantics: true,
      child: GestureDetector(
        onTap: () => launchUrl(
          MapConfig.attributionUrl,
          mode: LaunchMode.externalApplication,
        ),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.55),
            borderRadius: BorderRadius.circular(6),
          ),
          child: const Text(
            MapConfig.attribution,
            style: TextStyle(fontSize: 9, color: Colors.white),
          ),
        ),
      ),
    );
  }
}
