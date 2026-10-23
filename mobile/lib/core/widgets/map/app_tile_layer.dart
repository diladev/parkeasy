import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:mobile/core/config/map_config.dart';

/// The map tiles, set up the way the OSM tile policy asks: the app's id as
/// User-Agent, the default cache on, no retina tiles, no prefetching. In
/// the dark theme the tiles are darkened to match the app.
class AppTileLayer extends StatelessWidget {
  const AppTileLayer({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return TileLayer(
      urlTemplate: MapConfig.tileUrl,
      userAgentPackageName: MapConfig.userAgentPackageName,
      maxNativeZoom: MapConfig.maxNativeZoom,
      tileBuilder: isDark ? darkModeTileBuilder : null,
    );
  }
}
